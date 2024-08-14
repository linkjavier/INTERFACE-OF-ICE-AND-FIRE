// src/app/houses/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

interface House {
  name: string;
  swornMembers: string[];
}

interface Character {
  name: string;
  alive: boolean;
  deathInfo?: string;
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
  };
}

export default function HousesPage() {
  const [page, setPage] = useState(1);
  const { data: houses, isLoading, error } = useQuery({
    queryKey: ['houses', page],
    queryFn: () => fetchHouses(page),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong: {error.message}</p>;
  if (!houses) return <p>No houses found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Houses</h1>
      {houses.length === 0 ? (
        <p>No houses available on this page.</p>
      ) : (
        <>
          {houses.map((house) => (
            <div key={house.name} className="mb-6">
              <h2 className="text-xl font-semibold">{house.name}</h2>
              {house.swornMembers.length === 0 ? (
                <p>This house has no sworn members</p>
              ) : (
                <ul className="list-disc list-inside">
                  {house.swornMembers.map((member) => (
                    <SwornMember key={member} url={member} />
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="flex justify-between xl:justify-normal mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded text-black"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-300 rounded text-black"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SwornMember({ url }: { url: string }) {
  const { data: member, isLoading } = useQuery({
    queryKey: ['member', url],
    queryFn: () => fetchCharacter(url),
  });

  if (isLoading) return <li>Loading member...</li>;
  if (!member) return <li>Member data not found.</li>;

  const memberClass = member.alive ? 'text-green-600' : 'text-red-600';

  return (
    <li className={memberClass}>
      {member.name} {member.alive ? '(Alive)' : `(Deceased: ${member.deathInfo})`}
    </li>
  );
}
