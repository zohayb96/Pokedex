
export interface PokemonFormProps {
  onSubmit: (data: FormDataStructure) => void;
}

export interface PokemonDataStructure {
  id: number;
  name: string;
  pokemon_v2_pokemons?: any;
  base_happiness?: number;
  is_legendary?: boolean;
  is_mythical?: boolean;
  evolutions?: any;
  generation_id?: number;
}

export interface FormDataStructure {
  name: string;
}