import gql from 'graphql-tag'

export const SAVE_PARAMETER = gql`
  mutation MyMutation {
    saveParameter(parameterInput: ParameterInput) {
      id,
    }
  }
`
