# huh

visualize your codebase as a graph. uses ollama to parse code and turn it into json. then renders that shit with react flow.

## what it does

- parses your code with ollama (default: gemma3)
- converts to json
- renders a sick interactive graph
- has multiple layouts (vertical, horizontal, radial, force-directed)
- color codes by data type
- direct edges between nodes (none of that right-angle bullshit)
- smart node sizing
- copy node content with one click

## get it running

```bash
# clone this
git clone https://github.com/yourusername/huh.git
cd huh

# install deps
npm install

# start ollama (you need this installed)
ollama run gemma3

# run it
npm run dev

# go to http://localhost:3000
```

## how to use

1. paste your code
2. hit the green play button
3. wait for ollama to do its thing
4. play with the graph
5. profit

## tech stack

- next.js
- react
- material ui
- react flow
- elk layout algorithms
- ollama api

## why?

because visualizing code structure is cool and LLMs are good at understanding code. also i was bored.

## license

MIT. do whatever you want.
