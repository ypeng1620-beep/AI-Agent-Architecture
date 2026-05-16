#!/usr/bin/env python3
"""
Batch convert multiple files to markdown using MarkItDown

Enhanced with:
- Concurrent processing (--workers)
- Progress bar (--progress)
- Size limit validation (--max-size)
- Detailed error reporting (--errors-only)
"""

import sys
import argparse
import time
import concurrent.futures
from pathlib import Path
from markitdown import MarkItDown

# Size limits (bytes)
DEFAULT_MAX_SIZE = 500 * 1024 * 1024  # 500MB default


def convert_file(md_converter, input_path, output_dir=None, verbose=False, max_size=None):
    """Convert a single file to markdown with error handling and size check"""
    input_path = Path(input_path)
    
    if not input_path.exists():
        return {"path": str(input_path), "success": False, "error": "File not found", "skipped": True}
    
    # Check file size
    file_size = input_path.stat().st_size
    if max_size and file_size > max_size:
        return {"path": str(input_path), "success": False, "error": f"File too large ({file_size // (1024*1024)}MB > {max_size // (1024*1024)}MB)", "skipped": True}
    
    # Determine output path
    if output_dir:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{input_path.stem}.md"
    else:
        output_path = input_path.with_suffix(".md")
    
    start_time = time.time()
    try:
        if verbose:
            print(f"Converting: {input_path} ({file_size / 1024:.1f}KB)")
        
        result = md_converter.convert(str(input_path))
        elapsed = time.time() - start_time
        
        output_path.write_text(result.text_content)
        
        if verbose:
            size_kb = len(result.text_content) / 1024
            print(f"  → {output_path} ({size_kb:.1f}KB markdown, {elapsed:.1f}s)")
        
        return {
            "path": str(input_path),
            "success": True,
            "output": str(output_path),
            "elapsed": elapsed,
            "size_kb": file_size / 1024,
            "markdown_kb": len(result.text_content) / 1024
        }
    
    except Exception as e:
        return {
            "path": str(input_path),
            "success": False,
            "error": str(e),
            "elapsed": time.time() - start_time
        }


def main():
    parser = argparse.ArgumentParser(
        description="Batch convert files to markdown using MarkItDown",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s *.pdf -o markdown/
  %(prog)s "*.docx" "*.pptx" -v --workers 4
  %(prog)s report.pdf --max-size 100MB
        """
    )
    parser.add_argument(
        "files",
        nargs="+",
        help="Files to convert (supports glob patterns)"
    )
    parser.add_argument(
        "-o", "--output-dir",
        help="Output directory (default: same as input file)"
    )
    parser.add_argument(
        "-p", "--plugins",
        action="store_true",
        help="Enable plugins"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose output"
    )
    parser.add_argument(
        "-w", "--workers",
        type=int,
        default=1,
        help="Number of concurrent workers (default: 1, max: 8)"
    )
    parser.add_argument(
        "--max-size",
        type=str,
        default=None,
        help="Max file size (e.g., 100MB, 1GB). Default: 500MB"
    )
    parser.add_argument(
        "--errors-only",
        action="store_true",
        help="Only show errors in output"
    )
    parser.add_argument(
        "--llm-model",
        help="LLM model for image descriptions (e.g., gpt-4o)"
    )
    parser.add_argument(
        "--docintel-endpoint",
        help="Azure Document Intelligence endpoint"
    )
    
    args = parser.parse_args()
    
    # Parse max_size
    max_size = DEFAULT_MAX_SIZE
    if args.max_size:
        size_str = args.max_size.upper().rstrip('B')
        multipliers = {'K': 1024, 'M': 1024**2, 'G': 1024**3}
        if size_str[-1] in multipliers and size_str[:-1].isdigit():
            max_size = int(size_str[:-1]) * multipliers[size_str[-1]]
        elif size_str.isdigit():
            max_size = int(size_str)
        else:
            print(f"Warning: Invalid --max-size format '{args.max_size}', using default", file=sys.stderr)
    
    workers = min(max(args.workers, 1), 8)
    
    # Initialize MarkItDown
    md_kwargs = {"enable_plugins": args.plugins}
    
    if args.llm_model:
        try:
            from openai import OpenAI
            client = OpenAI()
            md_kwargs["llm_client"] = client
            md_kwargs["llm_model"] = args.llm_model
        except ImportError:
            print("Error: openai package required for LLM features", file=sys.stderr)
            print("Install with: pip install openai", file=sys.stderr)
            sys.exit(1)
    
    if args.docintel_endpoint:
        md_kwargs["docintel_endpoint"] = args.docintel_endpoint
    
    md = MarkItDown(**md_kwargs)
    
    # Collect all files
    all_files = []
    for file_pattern in args.files:
        if "*" in file_pattern or "?" in file_pattern:
            all_files.extend(Path(".").glob(file_pattern))
        else:
            all_files.append(Path(file_pattern))
    
    total_count = len(all_files)
    if total_count == 0:
        print("No files found matching the given patterns", file=sys.stderr)
        sys.exit(1)
    
    # Process files
    results = []
    success_count = 0
    error_count = 0
    skipped_count = 0
    
    if workers > 1:
        # Concurrent processing
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {executor.submit(convert_file, md, fp, args.output_dir, args.verbose, max_size): fp for fp in all_files}
            for i, future in enumerate(concurrent.futures.as_completed(futures)):
                result = future.result()
                results.append(result)
                if result["success"]:
                    success_count += 1
                elif result.get("skipped"):
                    skipped_count += 1
                else:
                    error_count += 1
                    if not args.errors_only:
                        print(f"  ❌ {result['path']}: {result['error']}", file=sys.stderr)
                
                # Progress indicator
                if not args.verbose and not args.errors_only:
                    done = i + 1
                    bar_len = 30
                    filled = int(bar_len * done / total_count)
                    bar = "█" * filled + "░" * (bar_len - filled)
                    print(f"\r  [{bar}] {done}/{total_count}", end="", flush=True)
    else:
        # Sequential processing
        for i, file_path in enumerate(all_files):
            result = convert_file(md, file_path, args.output_dir, args.verbose, max_size)
            results.append(result)
            if result["success"]:
                success_count += 1
            elif result.get("skipped"):
                skipped_count += 1
            else:
                error_count += 1
                if not args.errors_only:
                    print(f"  ❌ {result['path']}: {result['error']}", file=sys.stderr)
            
            # Progress indicator
            if not args.verbose and not args.errors_only:
                done = i + 1
                bar_len = 30
                filled = int(bar_len * done / total_count)
                bar = "█" * filled + "░" * (bar_len - filled)
                print(f"\r  [{bar}] {done}/{total_count}", end="", flush=True)
    
    print()  # newline after progress bar
    
    # Summary
    total_elapsed = sum(r.get("elapsed", 0) for r in results)
    total_input_mb = sum(r.get("size_kb", 0) for r in results if r["success"]) / 1024
    total_output_mb = sum(r.get("markdown_kb", 0) for r in results if r["success"]) / 1024
    
    if args.verbose or total_count > 1 or error_count > 0:
        print(f"\n📊 Batch Conversion Summary")
        print(f"   Total:   {total_count} files")
        print(f"   ✅ Success: {success_count}")
        if skipped_count > 0:
            print(f"   ⏭️  Skipped: {skipped_count}")
        if error_count > 0:
            print(f"   ❌ Errors:  {error_count}")
        print(f"   ⏱️  Time:    {total_elapsed:.1f}s total")
        if success_count > 0:
            print(f"   📦 Size:   {total_input_mb:.1f}MB → {total_output_mb:.1f}MB markdown")
    
    # Exit code: 0 if all succeeded, 1 otherwise
    sys.exit(0 if error_count == 0 and skipped_count == 0 else 1)


if __name__ == "__main__":
    main()
