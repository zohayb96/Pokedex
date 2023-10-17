import { gql } from "graphql-tag";
import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";

// Helper Functions
export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const client = new ApolloClient({
  ssrMode: true,
  cache: new InMemoryCache(),
  uri: "https://beta.pokeapi.co/graphql/v1beta",
});


// GraphQL Queries
export const query = gql`
  query allPokemons {
    gen3_species: pokemon_v2_pokemonspecies(order_by: { id: asc }) {
      name
      id
      base_happiness
      is_legendary
      is_mythical
      generation_id
      evolutions: pokemon_v2_evolutionchain {
        evolutionsChain: pokemon_v2_pokemonspecies {
          id
          name
        }
      }
    }
  }
`;
