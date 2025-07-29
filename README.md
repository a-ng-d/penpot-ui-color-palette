![GitHub package.json version](https://img.shields.io/github/package-json/v/a-ng-d/penpot-ui-color-palette?color=informational) ![GitHub last commit](https://img.shields.io/github/last-commit/a-ng-d/penpot-ui-color-palette?color=informational) ![GitHub](https://img.shields.io/github/license/a-ng-d/penpot-ui-color-palette?color=informational)

# UI Color Palette
UI Color Palette is a Penpot plugin that creates consistent and accessible color palettes specifically for UI. The plugin uses alternative color spaces, like `LCH`, `OKLCH`, `CIELAB`, `OKLAB`, and `HSLuv`, to create color shades based on the configured lightness scale. These spaces ensure [WCAG standards](https://www.w3.org/WAI/standards-guidelines/wcag/) compliance and sufficient contrast between information and background color.

The idea to make this Penpot plugin comes from the article: [Accessible Palette: stop using HSL for color systems](https://wildbit.com/blog/accessible-palette-stop-using-hsl-for-color-systems).

This plugin will allow you to:
- Create a complete palette from any existing color to help you build a color scaling (or Primitive colors).
- Manage the color palette in real-time to control the contrast.
- Sync the color shades with local styles, and third-party plugins.
- Generate code in various languages.
- Publish the palette for reuse across multiple documents or add shared palettes from the community.

## Documentation
The full documentation can be consulted on [docs.ui-color-palette.com](https://uicp.ylb.lt/docs-penpot-plugin).

## Contribution
### Community
Ask questions, submit your ideas or requests on [Canny](https://uicp.ylb.lt/ideas).

### Issues
Have you encountered a bug? Could a feature be improved?
Go to the [Issues](https://uicp.ylb.lt/report-for-penpot-plugin) section and browse the existing tickets or create a new one.

### Development
- Clone this repository (or fork it).
- Install dependencies with `npm install`.
- Run `npm run start:dev` to watch in development mode.
- Run `npm run start:ext` to run the external services such as the workers ansd the auth lobby.
- Go to Penpot, then `Plugins`, type this url: `http://localhost:4400/manifest.json` and validate.
- Create a `Branch` and open a `Pull Request`.
- _Let's do this._

### Beta test
- Go to the [Actions](https://github.com/a-ng-d/penpot-ui-color-palette/actions) sections and access the `Build and Download UI Color Palette` tab.
- Click `Run workflow`, then select a branch and confirm.
- Wait a minute, and once finished, download the artifact (which is a ZIP file containing the plugin).
- You can use a third-party tool to create a local server from the unzipped artifact, such as MAMP, WAMP, LAMP, etc.
- Go to Penpot, then `Plugins`, type this url: `http://localhost:{customPort}/manifest.json` and validate.
- _Enjoy!_

## Attribution
- The colors are managed thanks to the [chroma.js](https://github.com/gka/chroma.js) library by [Gregor Aisch](https://github.com/gka).
- The APCA algorithm is provided thanks to the [apca-w3](https://www.npmjs.com/package/apca-w3) module by [Andrew Somers](https://github.com/Myndex).

## Support
- [Follow the plugin LinkedIn page](https://uicp.ylb.lt/network).
- [Connect to my personal LinkedIn](https://uicp.ylb.lt/author).
