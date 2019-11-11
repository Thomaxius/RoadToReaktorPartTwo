const Handlebars = require('handlebars')


const styles = {
  styles: `	<style type="text/css">
		html {
			background: #f2f2f2;
		}
		body {
			background: #fff;
			color: #444;
			font-family: sans-serif;
			margin: 2em auto;
			padding: 1em 2em;
			max-width: 700px;
		}
		h1 {
			border-bottom: 2px solid #dadada;
			color: #666;
			font-size: 22px;
			margin: 30px 0 0 0;
			padding: 0;
			padding-bottom: 7px;
    }
    h3 {
      color: #666;
    }
		a {
			color: #0073aa;
		}

			</style>`
}

export const singlePackageTemplate = {
  style: styles.styles,
  header: `<div class="header">
                    <span><a href="/">Back to package listing..</a></span>
                    <h1>Package: {{ packageName }}</h1>
                </div>`,
  body: `
                <div class="body">
                    <h3>Description</h3> 
                      <b>{{ description.synopsis }}</b>
                      <p>{{ breaklines description.longDescription }}</p>
                    <h3>Dependencies ({{dependencies.length}})</h3> 
                    {{#each dependencies}}
                      {{#if this.isInstalled}}
                        <a href="/package/{{this.packageName}}">{{this.packageName}}</a>{{#unless @last}},{{/unless}}
                      {{/if}}
                      {{#unless this.isInstalled}}
                        {{this.packageName}}{{#unless @last}},{{/unless}}
                      {{/unless}}
                      {{#if alternatives.length}}
                      <i>
                        {{#each alternatives}}
                          {{#if this.isInstalled}}
                              *<a href="/package/{{this.packageName}}">{{this.packageName}}</a>{{#unless @last}},{{/unless}}
                          {{/if}}
                          {{#unless this.isInstalled}}
                              *{{this.packageName}}{{#unless @last}},{{/unless}}
                          {{/unless}}                     
                        {{/each}}
                      </i>
                        {{/if}}
                    {{/each}} 
                    <p><i>\* indicates an alternative dependency. </i></p>           
                      <h3>Packages that depend on {{ packageName }} ({{dependingPackageNames.length}})</h3> 
                          {{#each dependingPackageNames}}
                          <a href=/package/{{this}}>{{this}}</a>{{#unless @last}},{{/unless}}
                      {{/each}}
                </div>`
}

export const listingPageTemplate = {
  style: styles.styles,
  header: `<div class="header">
                    <h1>List of packages ({{this.length}})</h1>
                </div>`,
  body: `
                <div class="body">
                    {{#each this}}
                      <a href="/package/{{this.packageName}}">{{this.packageName}}</p>
                    {{/each}}
                </div>`
}

export const errorPageTemplate = {
  style: styles.styles,
  header: `<div class="header">
                    <span><a href="/">Back to package listing..</a></span>
                    <h1>Not found</h1>
                </div>`,
  body: `
                <div class="body">
                    The requested package was not found.
                </div>`
}
export class HtmlPage {

  public json: string;
  public template: Object;
  public html: string

  constructor(json: string, template: Object) {
    this.json = json;
    this.template = Object.values(template).join('');
    this.html = this.Page
  }

  get Page(): string {
    const template = Handlebars.compile(this.template);

    Handlebars.registerHelper('breaklines', ((text: string) => {
      text = Handlebars.Utils.escapeExpression(text);
      text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
      return new Handlebars.SafeString(text);
    }))

    const _html = template(JSON.parse(this.json));
    return _html
  }
}