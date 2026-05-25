import { useState } from 'react';
import Description from './Description';

function getAge(): number {
  const dob = new Date('2001-02-02');
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

const funFacts = [
  'i do not have a favorite color',
  'i like lowercase letters',
  'i have been to universal in florida 10 times',
  'i played divisional paintball for 2 years',
];

export default function AboutIsland() {
  const [funFact] = useState(() => funFacts[Math.floor(Math.random() * funFacts.length)]);
  const age = getAge();

  return (
    <>
      <Description
        description={`im damon, a ${age} year old software engineer based in the usa`}
        highlightedWords={['software', `${age}`, 'year', 'old', 'engineer', 'usa']}
      />
      <Description
        description="im currently working at blue origin helping the booster come back to the earth"
        highlightedWords={['blue', 'origin', 'booster', 'earth']}
      />
      <Description
        description="i attended the university of pittsburgh @ johnstown and graduated with a bachelors in computer science"
        highlightedWords={['university', 'pittsburgh', 'johnstown', 'bachelors', 'computer', 'science']}
      />
      <Description
        description={`fun fact: ${funFact}`}
        highlightedWords={['fun', 'fact:']}
      />
    </>
  );
}
