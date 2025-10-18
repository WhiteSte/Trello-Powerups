import { FunctionComponent, useState } from "react"
import styled from "styled-components"
import { Trello, TrelloIFrame } from "../types/trello"
import { useMount, useMounted } from "../util/Hooks"
import { Errors } from "../util/Errors"
import { LocalisedString } from "./LocalisedString"
import { Sizes } from "../res/Sizes"

const labelColours: Record<string, string> = {
    green: "#61bd4f",
    yellow: "#f2d600",
    orange: "#ff9f1a",
    red: "#eb5a46",
    purple: "#c377e0",
    blue: "#0079bf",
    sky: "#00c2e0",
    lime: "#51e898",
    pink: "#ff78cb",
    black: "#344563",
    "light-gray": "#b3bac5",
    "business-blue": "#0079bf"
}

type Label = Trello.PowerUp.Label

type LabelFilterProps = {
    trello?: TrelloIFrame
    selectedIds: string[]
    onChange: (ids: string[]) => void
    className?: string
}

export const LabelFilter: FunctionComponent<LabelFilterProps> = ({ trello, selectedIds, onChange, className }) => {
    const [labels, setLabels] = useState<Label[]>([])
    const [loading, setLoading] = useState(true)
    const mounted = useMounted()

    useMount(() => {
        const loadLabels = async () => {
            const board = await trello?.board("labels")
            const availableLabels = board?.labels ?? []

            if (mounted()) {
                setLabels(availableLabels)
                setLoading(false)
            }
        }

        loadLabels().catch(error => {
            if (mounted()) {
                setLabels([])
                setLoading(false)
            }

            Errors.warn(error)
        })
    })

    const toggleLabel = (id: string) => {
        const isSelected = selectedIds.includes(id)
        const nextSelection = isSelected ? selectedIds.filter(labelId => labelId !== id) : [...selectedIds, id]

        onChange(nextSelection)
    }

    const clearSelection = () => onChange([])

    return (
        <Wrapper className={className}>
            <FilterHeading>
                <LocalisedString stringKey={"filterByLabels"} trello={trello} />
            </FilterHeading>
            {loading ? (
                <StatusMessage>
                    <LocalisedString stringKey={"loading"} trello={trello} />
                </StatusMessage>
            ) : labels.length ? (
                <>
                    <LabelList>
                        {labels.map(label => {
                            const isSelected = selectedIds.includes(label.id)

                            return (
                                <LabelOption
                                    key={label.id}
                                    type="button"
                                    $selected={isSelected}
                                    onClick={() => toggleLabel(label.id)}
                                >
                                    <ColourSwatch $colour={label.color ?? undefined} aria-hidden={true} />
                                    <LabelName>
                                        {label.name ? (
                                            label.name
                                        ) : (
                                            <LocalisedString stringKey={"unnamedLabel"} trello={trello} />
                                        )}
                                    </LabelName>
                                </LabelOption>
                            )
                        })}
                    </LabelList>
                    <ClearButton type="button" onClick={clearSelection} disabled={!selectedIds.length}>
                        <LocalisedString stringKey={"clearLabelFilters"} trello={trello} />
                    </ClearButton>
                </>
            ) : (
                <StatusMessage>
                    <LocalisedString stringKey={"noLabelsAvailable"} trello={trello} />
                </StatusMessage>
            )}
        </Wrapper>
    )
}

const Wrapper = styled.div`
    align-self: stretch;
    margin-bottom: ${Sizes.standard}px;
`

const FilterHeading = styled.h3`
    margin: 0 0 ${Sizes.small}px 0;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    color: #5e6c84;
`

const LabelList = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${Sizes.small}px;
`

type LabelOptionProps = { $selected: boolean }

const LabelOption = styled.button<LabelOptionProps>`
    display: flex;
    align-items: center;
    gap: ${Sizes.small}px;
    padding: ${Sizes.small}px ${Sizes.standard}px;
    border-radius: ${Sizes.small}px;
    border: 1px solid ${({ $selected }) => ($selected ? "#0079bf" : "#dfe1e6")};
    background-color: ${({ $selected }) => ($selected ? "rgba(0, 121, 191, 0.08)" : "white")};
    cursor: pointer;
    text-align: left;

    &:hover {
        border-color: #0079bf;
    }
`

type ColourSwatchProps = { $colour?: string }

const ColourSwatch = styled.span<ColourSwatchProps>`
    width: 12px;
    height: 12px;
    border-radius: 2px;
    background-color: ${({ $colour }) => ($colour ? labelColours[$colour] ?? "#b3bac5" : "#b3bac5")};
`

const LabelName = styled.span`
    flex: 1;
    font-size: 14px;
`

const ClearButton = styled.button`
    margin-top: ${Sizes.small}px;
    align-self: flex-start;
    padding: ${Sizes.small}px ${Sizes.standard}px;
    border: none;
    border-radius: ${Sizes.small}px;
    background: transparent;
    color: #0079bf;
    cursor: pointer;

    &:disabled {
        color: #a5adba;
        cursor: default;
    }
`

const StatusMessage = styled.div`
    font-size: 14px;
    color: #5e6c84;
`
