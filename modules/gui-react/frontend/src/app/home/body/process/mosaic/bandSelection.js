import {Field, form} from 'widget/form'
import {RecipeActions, RecipeState} from 'app/home/body/process/mosaic/mosaicRecipe'
import {msg} from 'translate'
import Checkbox from 'widget/checkbox'
import ComboBox from 'widget/comboBox'
import React from 'react'
import _ from 'lodash'
import styles from './bandSelection.module.css'

const fields = {
    selection: new Field(),
    panSharpen: new Field()
}

const mapStateToProps = (state, ownProps) => {
    const recipeId = ownProps.recipeId
    const recipeState = RecipeState(recipeId)
    let values = recipeState('ui.bands')
    if (!values) {
        values = bandsAndPanSharpenToValues({
            bands: recipeState('model.bands'),
            panSharpen: recipeState('model.panSharpen')
        })
        RecipeActions(recipeId).setBands(values.selection).dispatch()
        RecipeActions(recipeId).setPanSharpen(values.panSharpen).dispatch()
    }
    const compositeOptions = recipeState('model.compositeOptions')
    return {
        source: recipeState.source(),
        surfaceReflectance: compositeOptions.corrections.includes('SR'),
        median: compositeOptions.compose === 'MEDIAN',
        values
    }
}

class BandSelection extends React.Component {
    state = {}
    options = [
        {
            label: msg('process.mosaic.bands.combinations'),
            options: [
                {value: 'RED, GREEN, BLUE', label: 'RED, GREEN, BLUE'},
                {value: 'NIR, RED, GREEN', label: 'NIR, RED, GREEN'},
                {value: 'NIR, SWIR1, RED', label: 'NIR, SWIR1, RED'},
                {value: 'SWIR2, NIR, RED', label: 'SWIR2, NIR, RED'},
                {value: 'SWIR2, SWIR1, RED', label: 'SWIR2, SWIR1, RED'},
                {value: 'SWIR2, NIR, GREEN', label: 'SWIR2, NIR, GREEN'},
            ]
        },
        {
            label: msg('process.mosaic.bands.metadata'),
            options: [
                {value: 'UNIX_TIME_DAYS', label: msg('bands.unixTimeDays')},
                {value: 'DAY_OF_YEAR', label: msg('bands.dayOfYear')},
                {value: 'DAYS_FROM_TARGET', label: msg('bands.daysFromTarget')}
            ]
        }
    ]
    optionByValue = {}

    constructor(props) {
        super(props)
        this.recipeActions = RecipeActions(props.recipeId)
        this.options.forEach(option => {
            if (option.options)
                option.options.forEach(option => this.optionByValue[option.value] = option)
            else
                this.optionByValue[option.value] = option
        })
    }

    render() {
        const {source, surfaceReflectance, median, inputs: {selection, panSharpen}} = this.props
        const canPanSharpen = source === 'LANDSAT'
            && !surfaceReflectance
            && ['RED, GREEN, BLUE', 'NIR, RED, GREEN'].includes(selection.value)
        const options = median
            ? this.options[0].options
            : this.options
        return (
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    {this.state.showSelector
                        ? <BandSelector
                            recipeActions={this.recipeActions}
                            selection={selection}
                            options={options}
                            onChange={() => this.setSelectorShown(false)}/>
                        : <SelectedBands
                            recipeActions={this.recipeActions}
                            selectedOption={this.optionByValue[selection.value]}
                            canPanSharpen={canPanSharpen}
                            panSharpen={panSharpen}
                            onClick={() => this.setSelectorShown(true)}/>
                    }
                </div>
            </div>
        )
    }

    setSelectorShown(shown) {
        this.setState(prevState =>
            ({...prevState, showSelector: shown})
        )
    }
}

const BandSelector = ({recipeActions, selection, options, onChange}) =>
    <ComboBox
        input={selection}
        placeholder={msg('process.mosaic.bands.placeholder')}
        options={options}
        autoFocus={true}
        openMenuOnFocus={true}
        menuPlacement='top'
        maxMenuHeight='40rem'
        isClearable={false}
        showChevron={false}
        showCurrentSelection={false}
        controlClassName={styles.selector}
        menuClassName={styles.menu}
        onMenuClose={onChange}
        onChange={option => {
            recipeActions.setBands(option ? option.value : null).dispatch()
            onChange()
        }}>
        {() => null}
    </ComboBox>

const SelectedBands = ({recipeActions, selectedOption, canPanSharpen, panSharpen, onClick}) => {
    const selection = selectedOption.label
    if (!selection)
        return null
    const bandList = selection.split(', ')
    const bandClasses = bandList.length === 1
        ? ['single']
        : ['red', 'green', 'blue']

    const bandElements = _.zip(bandList, bandClasses).map(([band, className]) =>
        <div key={className} className={styles[className]} onClick={onClick}>
            {band}
        </div>
    )
    return (
        <div className={styles.selection}>
            <div className={styles.selectedBands}>
                {bandElements}
            </div>

            {canPanSharpen
                ?
                <div className={styles.panSharpen}>
                    <Checkbox label={msg('process.mosaic.bands.panSharpen')} input={panSharpen} onChange={enabled =>
                        recipeActions.setPanSharpen(enabled).dispatch()
                    }/>
                </div>
                : null
            }

        </div>
    )

}

export default form({fields, mapStateToProps})(BandSelection)

const bandsAndPanSharpenToValues = ({bands, panSharpen}) => ({
    selection: bands.join(', '),
    panSharpen: panSharpen
})