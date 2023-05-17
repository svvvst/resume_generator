##  About
This resume generator allows conversion from a markdown-formatted resume to a pdf. The selected md file is first parsed to html and styled with css before conversion to pdf.

Options can be configured in config_new.json.


## Installation

Run the following command to clone the repository, change to the project directory, and install the required dependencies globally:

```bash
git clone https://github.com/svvvst/resume_generator.git && cd resume_generator && npm install -g
```


###  Requirements
- node.js
-- showdown.js
-- puppeteer.js
-- yargs.js

## Usage
Access the utility by entering `ezres` in the terminal. By default, the program will generate an html preview of the markdown file specified in `config_new.json`.

To generate a pdf version of your resume, execute the following:

`ezres --type pdf`

### Command Line Options

| Option          | Alias      | Description                                    | Default Value                                                                                                      |
| --------------- | ---------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| --version       |            | Show version number                            | [boolean]                                                                                                           |
| --help          |            | Show help                                      | [boolean]                                                                                                           |
| --type          | -t         | Type of document to generate: 'html' or 'pdf' | [string] [default: "html"]                                                                                          |
| --verbose       | -v         | Set verbose                                    | [boolean] [default: false]                                                                                          |
| --save-config   | --save     | Save current options to config                 | [boolean] [default: false]                                                                                          |
| --config        | -c         | Set config file                                | [string] [default: "config_new.json"]                                                                               |
| --saveas        | -s         | Set HTML save location and filename            | [string] [default: "export/resume.html"]                                                                            |
| --content       | -f, --resume, --file  | Set resume markdown file              | [string] [default: "../_resume_text/resume.md"]                                                                     |
| --template      | -m         | Set resume template file                       | [string] [default: "templates/temp.html"]                                                                           |
| --style         | -y         | Set CSS style                                  | [array] [default: ["templates/style.css", "templates/inline_skills.css"]]                                           |
| --contact       | -i         | Contact information                            | [default: {"name":"Alexander Swyst","address":"New York, New York","phone":"516.474.5162","email":"aswyst@gmail.com","web1":"linkedin.com/in/aswyst"}] |
| --pdf           | -p         | PDF object options                             | [default: {"saveas":"export/resume.pdf","pagesize":"Letter"}]                                                       |
| --substitutions | -b         | Substitution pairs                             | [default: {"COMPANY_NAME":"Deloitte","POSITION":"Data Analytics Solution Consultant role"}]                         |


##  Configuration
Open `config_new.json` located in the project directory. The file contains the following configuration options for generating an HTML resume and a PDF file:

1. `config`: Path to the configuration file itself (default: `"config_new.json"`).
2. `saveas`: The output path for the generated HTML resume (default: `"export/resume.html"`).
3. `content`: Path to the Markdown file containing the resume content (default: `"../_resume_text/resume.md"`).
4. `template`: Path to the HTML template file to use for generating the resume (default: `"templates/temp.html"`).
5. `style`: An array of paths to CSS files to apply styles to the resume (default: `["templates/style.css", "templates/inline_skills.css"]`).
6. `contact`: An object containing the contact information for the resume header. Additional fields can be added (or removed) as desired i.e. `web2`, `email2`, or `my_favorite_color`.
    - `name`: Full name 
    - `address`: Address 
    - `phone`: Phone number
    - `email`: Email address 
    - `web1`: A web address, such as a LinkedIn profile.
7. `pdf`: An object containing the PDF generation settings:
    - `saveas`: The output path for the generated PDF file (default: `"export/resume.pdf"`).
    - `pagesize`: The page size for the PDF (default: `"Letter"`).
8. `substitutions`: A configurable object containing key-value pairs for replacing placeholders in the resume content. For example, `{{COMPANY_NAME}}` in the resume content will be replaced with `Google`. You can add your own substitutions such as `{{SKILL1}}` or `{{SOME_KEYWORD}}`.


### Changing Config Location
If you want to use a custom config location, edit the `config` path in `config_default.json`, located in the project directory.


## HTML & CSS Templates
Resume layout can be revised by editing the HTML template located in the `templates` directory.

### temp.html
This HTML template serves as the base structure for the generated resume. It includes specific elements with designated IDs that will be programmatically filled with content from the config_new.json file and the resume markdown file.

- The `<style id="style"></style>` element in the `<head>` will be populated with the CSS styles specified in the configuration file.
- The `<h1 id=name>` element will display the user's name. It will be formatted independently - from other `<h1>` tags in the default CSS template.
- The `<ul id=contact>` element is an unordered list where the contact information specified in config_new.json will be displayed.
- The `<div id=content>` element is the area where the main body of the resume, converted from the markdown file, will be injected.
- The template also includes a script that organizes the specified section (in this case, 'skills') into columns. This script works by creating a container `<div>` element for the section and placing each list in a separate child `<div>` inside the container. This formatting is done to enhance the visual presentation of the resume.


### Custom Templates and Formatting

To create your own template using this framework, follow these steps:

1. Create a new HTML file for your custom template.
2. Inside the HTML file, include the necessary elements with specific IDs that will be filled with content from the `config_new.json` file and the resume markdown file:
   - `<style id="style"></style>`: This element will be populated with the CSS styles specified in the configuration file.
   - `<h1 id="name">`: This element will display the user's name.
   - `<ul id="contact">`: This element is an unordered list where the contact information specified in `config_new.json` will be displayed.
   - `<div id="content">`: This element is the area where the main body of the resume, converted from the markdown file, will be injected.
3. Add any additional elements, containers, or formatting as needed for your desired layout and design.
4. If you want to include any JavaScript for further customization or functionality, add the appropriate `<script>` tags and code.
5. Save your custom template HTML file.
6. Update the `config_new.json` file to point to your custom template by modifying the `template` value to the path of your custom template HTML file.

Now, when you run the script, it will use your custom template to generate the resume.
