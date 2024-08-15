// src/app/characters/[characterId].tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';

interface Character {
  name: string;
  alive: boolean;
  gender: string;
  culture: string;
  born: string;
  died: string;
  titles: string[];
  aliases: string[];
}

async function fetchCharacterData(id: string): Promise<Character> {
  const { data } = await axios.get(`https://anapioficeandfire.com/api/characters/${id}`);
  return {
    name: data.name,
    alive: !data.died,
    gender: data.gender,
    culture: data.culture,
    born: data.born,
    died: data.died,
    titles: data.titles,
    aliases: data.aliases,
  };
}

export default function CharacterPage() {
  const { characterId } = useParams();
  const router = useRouter();
 

  const { data: character, isLoading, error } = useQuery({
    queryKey: ['character', characterId],
    queryFn: () => fetchCharacterData(characterId as string),
    enabled: !!characterId,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen flex-col">
      <img src="/GOT.png" alt="Loading..." className="mb-4" />
      <p className='text-4xl'>Loading...</p>
    </div>
  );
  if (error) return <div className="flex items-center justify-center h-screen">Something went wrong: {error.message}</div>;
  if (!character) return <div className="flex items-center justify-center h-screen">Character not found.</div>;

  const memberClass = character.alive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-black">
      <h1 className={`text-4xl font-extrabold ${memberClass} mb-4`}>{character.name}</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p><strong>Gender:</strong> {character.gender}</p>
        <p><strong>Culture:</strong> {character.culture}</p>
        <p><strong>Born:</strong> {character.born}</p>
        {character.alive ? (
          <p><strong>Status:</strong> Alive</p>
        ) : (
          <p><strong>Died:</strong> {character.died}</p>
        )}
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Titles:</h2>
          <ul className="list-disc list-inside">
            {character.titles.map((title, index) => (
              <li key={index}>{title}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Aliases:</h2>
          <ul className="list-disc list-inside">
            {character.aliases.map((alias, index) => (
              <li key={index}>{alias}</li>
            ))}
          </ul>
        </div>
      </div>
      <button
        onClick={() => router.push('/houses')}
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
      >
        Back to Houses
      </button>
    </div>
  );
}
