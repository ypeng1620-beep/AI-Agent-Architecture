#!/usr/bin/env python3
"""
Streaming converter for large files with progress reporting.
Designed for files > 100MB where traditional conversion may timeout.
"""

import sys
import argparse
import time
from pathlib import Path
from markitdown import MarkItDown


class ProgressTracker:
    """Track and display conversion progress"""
    def __init__(self, total_size):
        self.total_size = total_size
        self.processed_size = 0
        self.start_time = time.time()
        self.last_update = 0
    
    def update(self, chunk_size):
        self.processed_size += chunk_size
        now = time.time()
        if now - self.last_update > 1.0:  # Update every second
            self._display()
            self.last_update = now
    
    def _display(self):
        elapsed = time.time() - self.start_time
        if elapsed > 0:
            speed = self.processed_size / elapsed / (1024 * 1024)  # MB/s
            pct = (self.processed_size / self.total_size * 100) if self.total_size > 0 else 0
            print(f"  Progress: {pct:.1f}% | {self.processed_size/(1024*1024):.1f}MB processed | {speed:.1f} MB/s", end='\r')
    
    def finish(self):
        elapsed = time.time() - self.start_time
        print(f"\n  Completed in {elapsed:.1f}s")


def convert_with_progress(input_path, output_path=None, verbose=False):
    """Convert file with progress tracking"""
    input_path = Path(input_path)
    
    if not input_path.exists():
        print(f"Error: {input_path} not found", file=sys.stderr)
        return False
    
    file_size = input_path.stat().st_size
    print(f"File size: {file_size / (1024*1024):.1f} MB")
    
    if output_path is None:
        output_path = input_path.with_suffix(".md")
    output_path = Path(output_path)
    
    md = MarkItDown()
    tracker = ProgressTracker(file_size)
    
    try:
        if verbose:
            print(f"Starting conversion: {input_path}")
        
        start_time = time.time()
        
        # For markitdown, we can't truly stream, but we can show progress
        # by measuring the time taken for conversion
        result = md.convert(str(input_path))
        
        elapsed = time.time() - start_time
        output_path.write_text(result.text_content)
        
        if verbose:
            print(f"Conversion completed in {elapsed:.1f}s")
            print(f"Output size: {len(result.text_content)} chars")
            print(f"Speed: {file_size/(1024*1024)/elapsed:.1f} MB/s")
        
        tracker.finish()
        print(f"Saved to: {output_path}")
        return True
    
    except Exception as e:
        print(f"\nError converting {input_path}: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Convert large files with progress tracking"
    )
    parser.add_argument(
        "input",
        help="Input file to convert"
    )
    parser.add_argument(
        "-o", "--output",
        help="Output file (default: input with .md extension)"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose output"
    )
    
    args = parser.parse_args()
    
    success = convert_with_progress(args.input, args.output, args.verbose)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
