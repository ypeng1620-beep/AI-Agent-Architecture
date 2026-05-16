---
name: markitdown-skill
description: OpenClaw agent skill for converting documents to Markdown. Documentation and utilities for Microsoft's MarkItDown library. Supports PDF, Word, PowerPoint, Excel, images (OCR), audio (transcription), HTML, YouTube.
metadata:
  openclaw:
    emoji: "📄"
    homepage: https://github.com/karmanverma/markitdown-skill
    requires:
      bins: ["python3", "pip", "markitdown"]
    install:
      - id: "markitdown"
        kind: "pip"
        package: "markitdown[all]"
        bins: ["markitdown"]
        label: "Install MarkItDown CLI (pip)"
---

# MarkItDown Skill

Documentation and utilities for converting documents to Markdown using Microsoft's [MarkItDown](https://github.com/microsoft/markitdown) library.

> **Note:** This skill provides documentation and a batch script. The actual conversion is done by the `markitdown` CLI/library installed via pip.

## When to Use

**Use markitdown for:**
- 📄 Fetching documentation (README, API docs)
- 🌐 Converting web pages to markdown
- 📝 Document analysis (PDFs, Word, PowerPoint)
- 🎬 YouTube transcripts
- 🖼️ Image text extraction (OCR)
- 🎤 Audio transcription

## Quick Start

```bash
# Convert file to markdown
markitdown document.pdf -o output.md

# Convert URL
markitdown https://example.com/docs -o docs.md
```

## Supported Formats

| Format | Features |
|--------|----------|
| PDF | Text extraction, structure |
| Word (.docx) | Headings, lists, tables |
| PowerPoint | Slides, text |
| Excel (.xlsx, .xls) | Tables, sheets |
| Images | OCR + EXIF metadata |
| Audio | Speech transcription |
| HTML | Structure preservation |
| YouTube | Video transcription |
| ZIP | Iterates over all files inside |

## Installation

The skill requires Microsoft's `markitdown` CLI:

```bash
pip install 'markitdown[all]'
```

Or install specific formats only:
```bash
pip install 'markitdown[pdf,docx,pptx]'
```

## Common Patterns

### Fetch Documentation
```bash
markitdown https://github.com/user/repo/blob/main/README.md -o readme.md
```

### Convert PDF
```bash
markitdown document.pdf -o document.md
```

### Batch Convert
```bash
# Using included script
python ~/.openclaw/skills/markitdown-skill/scripts/batch_convert.py docs/*.pdf -o markdown/ -v

# Or shell loop
for file in docs/*.pdf; do
  markitdown "$file" -o "${file%.pdf}.md"
done
```

## Python API

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("document.pdf")
print(result.text_content)
```

## Quick Reference

| Scenario | Command |
|----------|---------|
| Single file | `markitdown file.ext -o out.md` |
| URL to markdown | `markitdown https://url -o out.md` |
| Batch (directory) | `markitdown docs/*.pdf -o markdown/` |
| Large file (>100MB) | `python scripts/stream_convert.py large.pdf -v` |
| Auto-detect format | `markitdown file -o out.md` (no `-f` needed) |
| Preserve structure | `markitdown doc.pdf --prefer-结构 -o out.md` |

## Troubleshooting

### "markitdown not found"
```bash
pip install 'markitdown[all]'
```

### OCR Not Working
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### Large File Conversion (>100MB)
```bash
# For files > 100MB with progress tracking
python scripts/stream_convert.py large_file.pdf -v

# Output shows:
# File size: 250.5 MB
#   Progress: 45.2% | 112.8MB processed | 12.3 MB/s
#   Completed in 20.4s
# Saved to: large_file.md
```

### Corrupted or Unreadable Files

**Symptoms:** Conversion hangs, crashes, or returns empty content.

```python
import subprocess
import os

def safe_convert(input_path, output_path, timeout=120):
    """Convert file with timeout and error handling."""
    try:
        result = subprocess.run(
            ['markitdown', input_path, '-o', output_path],
            capture_output=True,
            text=True,
            timeout=timeout  # Kill if stuck >2min
        )
        if result.returncode != 0:
            print(f"STDERR: {result.stderr}")
            return False
        # Verify output is non-empty
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True
        else:
            print(f"Output file empty or missing for {input_path}")
            return False
    except subprocess.TimeoutExpired:
        print(f"Timeout converting {input_path} (> {timeout}s)")
        return False
    except Exception as e:
        print(f"Error converting {input_path}: {e}")
        return False

# Batch with error resilience
def batch_convert_safe(files, output_dir, timeout=120):
    results = {'success': [], 'failed': []}
    for f in files:
        basename = os.path.splitext(os.path.basename(f))[0]
        out_path = os.path.join(output_dir, basename + '.md')
        if safe_convert(f, out_path, timeout=timeout):
            results['success'].append(f)
        else:
            results['failed'].append(f)
    print(f"Converted: {len(results['success'])}, Failed: {len(results['failed'])}")
    return results
```

### Format Auto-Detection
MarkItDown auto-detects file format from extension. If your file has a non-standard extension:
```bash
# Force format with -f flag
markitdown file.xyz -f pdf -o out.md
```

For unknown binary files, try the Python API with error catching:
```python
from markitdown import MarkItDown

md = MarkItDown()
try:
    result = md.convert("file.unknown")
    print(result.text_content)
except Exception as e:
    print(f"Unsupported or corrupted: {e}")
```

## What This Skill Provides

| Component | Source |
|-----------|--------|
| `markitdown` CLI | Microsoft's pip package |
| `markitdown` Python API | Microsoft's pip package |
| `scripts/batch_convert.py` | This skill (utility) |
| `scripts/stream_convert.py` | This skill (large file streaming) |
| Documentation | This skill |

## See Also

- [USAGE-GUIDE.md](USAGE-GUIDE.md) - Detailed examples
- [reference.md](reference.md) - Full API reference
- [Microsoft MarkItDown](https://github.com/microsoft/markitdown) - Upstream library
