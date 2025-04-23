const { pdfGenerator } = require('../utils')

const content = () => [
  {
    style: 'tableExample',
    table: {
      body: [
        ['Column 1', 'Column 2', 'Column 3'],
        [
          {
            stack: [
              'Let\'s try an unordered list',
              {
                ul: [
                  'item 1',
                  'item 2'
                ]
              }
            ]
          },
          [
            'or a nested table',
            {
              table: {
                body: [
                  ['Col1', 'Col2', 'Col3'],
                  ['1', '2', '3'],
                  ['1', '2', '3']
                ]
              },
            }
          ],
          {
            text: [
              'Inlines can be ',
              { text: 'styled\n', italics: true },
              { text: 'easily as everywhere else', fontSize: 10 }]
          }
        ]
      ]
    }
  }
]

const debugPdf = async () => {
  const docDefinition = {
    pageSize: 'A5',
    pageOrientation: 'potrait',
    content: content(),
    styles: {
      header: {
        margin: [0, 0, 0, 0]
      }
    }
  }
  const generate = await pdfGenerator(docDefinition, './storages/tmp/example.pdf')
  return generate
}
debugPdf()
