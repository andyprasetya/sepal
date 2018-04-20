import PropTypes from 'prop-types'
import React from 'react'
import {Msg, msg} from 'translate'
import {Constraints, ErrorMessage, form, Input} from 'widget/form'
import {RecipeActions, RecipeState} from '../../mosaicRecipe'
import ConfirmationButtons from '../confirmationButtons'
import styles from './dates.module.css'

const inputs = {
    // country: new Constraints()
    //     .notBlank('process.mosaic.panel.areaOfInterest.form.country.required'),
}

const mapStateToProps = (state, ownProps) => {
    const recipe = RecipeState(ownProps.id)
    return {
        values: recipe('dates')
    }
}

class Dates extends React.Component {
    constructor(props) {
        super(props)
        this.recipe = RecipeActions(props.id)
    }
    render() {
        const {className, form, inputs: {country}} = this.props
        return (
            <div className={className}>
                <div className={styles.container}>
                    <div>
                        <Msg id={'process.mosaic.panel.dates.title'}/>
                    </div>
                </div>
            </div>
        )
    }
}

Dates.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    form: PropTypes.object,
    inputs: PropTypes.shape({
    }),
    action: PropTypes.func,
    values: PropTypes.object
}

export default form(inputs, mapStateToProps)(Dates)