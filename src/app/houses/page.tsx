// src/app/houses/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import Link from 'next/link';

interface House {
  name: string;
  swornMembers: string[];
}

interface Character {
  name: string;
  alive: boolean;
  deathInfo?: string;
  url: string;
}

async function fetchHouses(page: number): Promise<House[]> {
  const { data } = await axios.get(`https://anapioficeandfire.com/api/houses?page=${page}&pageSize=10`);
  return data.map((house: any) => ({
    name: house.name,
    swornMembers: house.swornMembers,
  }));
}

async function fetchCharacter(url: string): Promise<Character> {
  const { data } = await axios.get(url);
  return {
    name: data.name,
    alive: !data.died,
    deathInfo: data.died ? `Died in ${data.died}` : undefined,
    url: url,
  };
}

export default function HousesPage() {
  const [page, setPage] = useState(1);
  const { data: houses, isLoading, error } = useQuery({
    queryKey: ['houses', page],
    queryFn: () => fetchHouses(page),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen flex-col">
      <img src="/GOT.png" alt="Loading..." className="mb-4" />
      <p className='text-4xl'>Loading...</p>
    </div>
  );
  if (error) return <div className="flex items-center justify-center h-screen">Something went wrong: {error.message}</div>;
  if (!houses) return <div className="flex items-center justify-center h-screen">No houses found.</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Houses of Westeros</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {houses.map((house) => (
          <div key={house.name} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">{house.name}</h2>
            {house.swornMembers.length > 0 ? (
              <ul className="space-y-2">
                {house.swornMembers.map((member) => (
                  <SwornMember key={member} url={member} />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">This house has no sworn members</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function SwornMember({ url }: { url: string }) {
  const { data: member, isLoading, error } = useQuery({
    queryKey: ['member', url],
    queryFn: () => fetchCharacter(url),
  });

  if (isLoading) return <li className="text-gray-500">Loading member...</li>;
  if (error) return <li className="text-red-500">Error loading member: {error.message}</li>;
  if (!member) return <li className="text-red-500">Member data not found.</li>;

  const memberClass = member.alive ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold';

  return (
    <li className={`${memberClass} text-lg`}>
      <Link href={`/characters/${member.url.split('/').pop()}`}>
        {member.name} {member.alive ? '(Alive)' : `(Deceased: ${member.deathInfo})`}
      </Link>
    </li>
  );
}
