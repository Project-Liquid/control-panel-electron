## ASI Control Panel

### Running the program

1. Clone the repository.
   ```bash
   git clone <repository_url>
   ```
   
2. Ensure the latest versions of yarn and node.js LTS are installed. This project was developed with node v22.13.1 in mind.

3. Install dependencies.
   ```bash
   cd <repository_directory>
   npm install
   ```

4. Run the project.
   ```bash
   npm start
   ```

### Miscellaneous issues

This project uses platform-specific dependencies, so some things (like running from WSL) are buggy. In these cases, try installing platform-specific dependencies (e.g., `@esbuild/linux_x64`). For further support, contact nathan.abebe@yale.edu.
