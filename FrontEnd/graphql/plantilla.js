import { gql } from 'graphql-request'

export default {
  GET_PERSONAS: gql`
    query GetPersonas {
      personas: getPersonas {
        id
        nombre
        id_grupo
        grupo
        telefono
      }
    }
  `,
  GET_GRUPOS: gql`
    query GetGrupos {
      grupos: getGrupos {
        id
        grupo
      }
    }
  `,
  SAVE_PERSONA: gql`
    mutation SavePersona($input: InputPersona!) {
      savePersona(input: $input)
    }
  `,
  DELETE_PERSONA: gql`
    mutation DeletePersona($id: ID!) {
      deletePersona(id: $id)
    }
  `,
  DELETE_PERSONAS: gql`
    mutation DeletePersonas($ids: [ID]!) {
      deletePersonas(ids: $ids)
    }
  `
}
