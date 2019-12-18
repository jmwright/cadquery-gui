## Usage

### Table of Contents
- [Environment Variables](usage.md#environment-variables)

### Environment Variables

Environment variables are set when a script is executed to give access to the path the script is running from. This is needed because of the way CQG indirectly executes scripts via the CadQuery Gateway Interface (CQGI). This method of execution may make items like settings files in the script's parent directory unavailable. To access these environment variables, use `import os` and then `os.environ["VARIABLE_NAME"]`.

* **MYSCRIPT_FULL_PATH** - Includes the full path and filename of the script being executed.
* **MYSCRIPT_DIR** - Full path excluding the filename, giving the directory the script resides in.

Here is an example of retrieving the value and using these environment variables:

```python
import os

config = '{path:s}/config.yaml'.format(path=os.environ["MYSCRIPT_DIR"])
file = open(config, 'r')
print(file.read())
```