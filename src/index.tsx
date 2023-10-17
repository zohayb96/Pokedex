import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// const altquery = gql`
//   query pokemonsFiltered($searchTerm: String!) { 
//     gen3_species: pokemon_v2_pokemonspecies(order_by: { id: asc }, limit: 100, where: { name: { _regex: $searchTerm } }) {
//       name
//       id
//       base_happiness
//       is_legendary
//       is_mythical
//       evolutions: pokemon_v2_evolutionchain {
//         evolutionsChain: pokemon_v2_pokemonspecies {
//           id
//           name
//           generation_id
//         }
//       }
//     }
//   }
// `;
