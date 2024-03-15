# Demo - structured missingness explainer

The [Turing-Roche Partnership](https://www.turing.ac.uk/research/research-projects/alan-turing-institute-roche-strategic-partnership) launched in June 2021 and is a 5 year academic-industry collaboration developing new data science methods to investigate large, complex, clinical and healthcare datasets to better understand how and why patients respond differently to treatment, and how treatment can be improved.
The partnership had an exhibit at the AI UK Conference in March 2024 and as part of that developed an interactive demo for attendees to engage with, which is also now available here. The demo was developed by Camila Rangel Smith and Evelina Gabasova from the [Turing Research Engineering Group](https://www.turing.ac.uk/work-turing/research/research-engineering-group), with content input from Sarah McGough, Vicky Hellon and Chris Banerji from the partnership team.
The demo aims to take users on an interactive clinical journey to understand how clinical data is collected and combined in practice, and introduce the partnership's research theme on structured missingness. You can find out more about the partnership [here](https://www.turing.ac.uk/research/research-projects/alan-turing-institute-roche-strategic-partnership) and our research on structured missingness [here](https://www.nature.com/articles/s42256-022-00596-z).

You can find the demo deployed in GitHub pages in the following link: [structured missingness explainer AIUK demo](https://alan-turing-institute.github.io/structured-missingness-explainer/).

## Building the demo locally in your machine

### Prerequisites:

- Node.js
- Typescript: `npm install --save-dev typescript`
- http-server: `npm install -g http-server`

### Build:

1. Install dependencies
```
npm install
```

2. Compile the TypeScript file to JavaScript:

```bash
npx tsc
```

3. Run a local server to preview 
```bash
http-server
```
in the folder that contains `index.html`. Navigate to `http://localhost:8080` in the browser.

