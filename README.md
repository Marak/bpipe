# bpipe

## Browser <==> Unix Pipes

`bpipe` is a command line tool which allows you to create readable and writable streams between standard Unix Pipes and the browser to run commands like this:

```bash
bpipe -s "#myInput" -e "keyup" | less
echo "hello there" | bpipe -s "#myDiv"
````

# Installation

```bash
npm install bpipe -g
```

# Usage

```
  Usage: bpipe [server] [options]

  server: the location of the `bpipe-server` to connect to
          Defaults to localhost:8001

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -s, --selector [string]  the CSS selector to attach to
    -e, --event [string]     the DOM event to attach to
    -u, --url [string]       the url to connect to

```


# Examples

A hosted `bpipe-server` service is available at [http://bpipe.io](http://bpipe.io). This allows the use of `bpipe` without needing to setup a server.

You can also run a local server using the following command:

```bash
bpipe-server
open index.html
```

## STDIN

### Pipe data from a text `<input>` to `less`

```bash
bpipe -s "#myInput" -e "keyup" | less
```

*Whenever the select box is changed in the browser, the new value will be piped to less*

<img src="https://github.com/Marak/bpipe/raw/master/screenshots/pipe-text-input-to-less.gif"/>


### Pipe data from a `<select>` box to `less`

```bash
bpipe -s "#mySelect" -e "change" | less
```

*Whenever the select box is changed in the browser, the new value will be piped to less*

<img src="https://github.com/Marak/bpipe/raw/master/screenshots/pipe-select-box-to-less.gif"/>



## STDOUT

### Pipe data from `echo` to a div's innerHTML
  
```bash
echo "hello there" | bpipe -s "#myDiv"
```

*When this command is run the browser will update with "hello there"*

<img src="https://github.com/Marak/bpipe/raw/master/screenshots/pipe-echo-to-div.gif"/>


### Caveats

`bpipe` will only work if the custom `.js` file is loaded on the page you wish to interact with. You will also need to run a websocket server to facilitate communication between the browser and `bpipe`. A server and browser bundle are both included in this project. A free `bpipe` service is also available at [http://bpipe.io](http://bpipe.io)

In the not so distant future perhaps browsers will natively support this type of interaction. Until then, we polyfill.

### Can I actually use `tail`?

Of course! You can use any standard Unix tool. If you want to use `tail` it should work by creating a temporary file or named piped.
`less` also works pretty well.

```bash
bpipe -s "#mySelect" -e "change" > /tmp/select.log
tail -f /tmp/select.log
```

### Open Ownership / Open Contribution

If anyone is interested in contributing to the project I would be glad to add additional contributors / owners. 

## Status

The current build is functional, but should be considered experimental. With a little more polish, `bpipe` could be a useful tool. If anyone wants to help further develop this tool feel free to reach out or start opening up pull requests.

## TODO

* Better querySelectorAll support
 - binding complex query statements
 - using selectors that contain more than one match
* Add ability to open new pages with one line
 - `echo "*Hello" | marked | bpipe index.html`
* Unit tests
 - The library needs unit tests.
* Better configuration options for `bpipe` and `bpipe-server`
 - Allow `bpipe` and `bpipe-server` to specify host and port
 - Create `.bpipe` configuration file
* Implement WebRTC communication to bypass having to pass data through server

### Dependencies / Acknowledgements

- [websocket-stream](https://github.com/maxogden/websocket-stream) by @maxodgen
- [domnode-dom](https://github.com/chrisdickinson/domnode-dom) by @chrisdickinson
- [ws](https://github.com/einaros/ws) by @einaros
- [Dominic Tarr](https://github.com/dominictarr/)

## License
MIT

