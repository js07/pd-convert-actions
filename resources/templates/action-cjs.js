export default `{{#if (isdefined hashId)}}
// legacy_hash_id: {{hashId}}
{{/if}}
{{#if defineComponent}}
module.exports = defineComponent({
  {{> componentProperties }}
})
{{else}}
module.exports = {
  {{> componentProperties }}
}
{{/if}}

{{~#*inline "componentProperties"}}
{{#if key}}
  key: {{tostring key}},
{{/if}}
{{#if name}}
  name: {{tostring name}},
{{/if}}
{{#if description}}
  description: {{tostring description}},
{{/if}}
{{#if version}}
  version: {{tostring version}},
{{/if}}
{{#if key}}
  type: "action",
{{/if}}
{{#if props.[0]}}
  props: {
  {{#each props}}
    {{> componentProp }}
  {{/each}}
  },
{{/if}}
  async run({ steps, $ }) {{{code}}}
{{/inline}}

{{~#*inline "componentProp"}}
  {{#if this.isString}}  
    {{this.key}}: "{{this.type}}",
  {{else}}
    {{this.key}}: {
      type: "{{this.type}}",
    {{#if this.app}}
      app: {{tostring this.app}},
    {{/if}}
    {{#if (isdefined this.label)}}
      label: {{{tostring this.label}}},
    {{/if}}
    {{#if (isdefined this.description)}}
      description: {{tostring this.description}},
    {{/if}}
    {{#if (isdefined this.optional)}}
      optional: {{this.optional}},
    {{/if}}
    {{#if (isdefined this.options)}}
      options: [
      {{#each this.options}}
        {{tostring this}},
      {{/each}}
      ],
    {{/if}}
    },
  {{/if}}
{{/inline}}`;