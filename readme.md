#  About
This resume generator allows conversion from a markdown-formatted resume to a pdf. The selected md file is first parsed to html and styled with css before conversion to pdf.

Options can be configured in cfg.json.

# Installation

Run the installer located in ./install or install the following packages manually.

##  Requirements
- node.js
- showdown.js
- puppeteer.js

#  Configuration
Open cfg.json.

Options:
- content: markdown format resume file.
- template: html format resume template.
- style: css file to style resume.
- saveas: location to save html file.
- contact: additional invormation can be added here i.e. web2, phone2, etc.
- name: name heading
- pdf, saveas: pdf resume file location
- pagesize: pdf resume paper size.

#  Style
All style can be adjusted in the style.css or other configured stylesheet.
