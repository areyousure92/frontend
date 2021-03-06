/* eslint-disable react/prop-types */
import React from "react"
import PrismComponents from "prismjs/components"
import ReactSelect from "react-select"
import styled from "styled-components"
import PropTypes from "prop-types"

const MultiSelect = styled(ReactSelect)`
  color: black;
`

const exclude = {
  meta: true,
  markup: true,
}

const languages = Object.entries(PrismComponents.languages).reduce(
  (acc, [key, value]) => {
    if (exclude[key]) {
      return acc
    }
    return {
      ...acc,
      [key]: {
        label: value.title,
        isLoaded: false,
      },
    }
  },
  {},
)

const optionsForSelect = Object.entries(languages)
  .reduce(
    (acc, [key, value]) => [...acc, { value: key, label: value.label }],
    [],
  )
  .sort((a, b) => {
    const nameA = a.value.toUpperCase()
    const nameB = b.value.toUpperCase()

    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }
    return 0
  })

export class CodeBlock extends React.Component {
  static propTypes = {
    editor: PropTypes.shape({}).isRequired,
    node: PropTypes.shape({}).isRequired,
    className: PropTypes.string.isRequired,
    attributes: PropTypes.shape({}).isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  }

  componentDidMount() {
    const { editor, node } = this.props

    const codeLanguage = node.data.get("language")

    if (languages[codeLanguage]) {
      import(`prismjs/components/prism-${codeLanguage}.min`)
        .then(() => {
          languages[codeLanguage].isLoaded = true
          editor.setNodeByKey(node.key, { data: { language: codeLanguage } })
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.warn(`[@code-plugin/code-block:onChange]: ${error.message}`)
        })
    }
  }

  onChange = (selectedLanguage) => {
    const { editor, node } = this.props

    if (languages[selectedLanguage]) {
      if (languages[selectedLanguage].isLoaded) {
        editor.setNodeByKey(node.key, { data: { language: selectedLanguage } })
      } else {
        import(`prismjs/components/prism-${selectedLanguage}.min`)
          .then(() => {
            languages[selectedLanguage].isLoaded = true
            editor.setNodeByKey(node.key, {
              data: { language: selectedLanguage },
            })
          })
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.warn(`[@code-plugin/code-block:onChange] ${error.message}`)
          })
      }
    }
  }

  render() {
    const { editor, className, node, attributes, children } = this.props
    const language = node.data.get("language")
    const selectedValueForSelect = optionsForSelect.find(
      (item) => item.value === language,
    )

    const languageComponent = editor.readOnly ? (
      <LanguageName>{language}</LanguageName>
    ) : (
      <div
        contentEditable={false}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          width: "200px",
        }}
      >
        <MultiSelect
          value={selectedValueForSelect}
          onChange={({ value }) => this.onChange(value)}
          options={optionsForSelect}
        />
      </div>
    )

    return (
      <div style={{ position: "relative" }}>
        <div className={className} style={{ position: "relative" }}>
          <pre className={`language-${language}`}>
            <code {...attributes} className={`language-${language}`}>
              {children}
            </code>
          </pre>
        </div>
        {languageComponent}
      </div>
    )
  }
}

const LanguageName = styled.div`
  position: absolute;
  left: 0rem;
  top: 0.5rem;
  writing-mode: vertical-rl;
  transform: rotate(180deg);
`
