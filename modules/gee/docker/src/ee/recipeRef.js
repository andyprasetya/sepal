const ee = require('@google/earthengine')
const {of} = require('rxjs')
const imageFactory = require('@sepal/ee/imageFactory')

const asset = ({id}) => {
    console.log(recipe)
    const recipe = null // TODO: Load recipe from Sepal

    return imageFactory(recipe)
}

module.exports = asset