import Description from "~/components/Description";
import {createEffect, createSignal} from "solid-js";

export default function About() {
    const age = new Date('2001-02-02');

    const randomFunFact = [
        'i do not have a favorite color',
        'i like lowercase letters',
        'i have been to universal in florida 10 times',
        'i played divisional paintball for 2 years',
        'my girlfriends dogs are named jax & koda',
    ]

    createEffect(() => {
        document.title = 'damon | about'
    })


    return (
        <main class="flex flex-col justify-center items-center text-center p-6 sm:p-10 sm:h-[85vh] animate-fade-in">
            <h1 class="text-2xl sm:text-4xl italic mb-2">hi.</h1>
            <Description
                description={`im damon, a ${new Date().getFullYear() - age.getFullYear()} year old software engineer based in the usa`}
                highlightedWords={['software', '22', 'year', 'old', 'engineer', 'usa']}/>
            <Description description={"im currently working at t rowe price working on emerging technologies"}
                         highlightedWords={['t', 'rowe', 'price', 'emerging', 'technologies']}/>
            <Description
                description={'i attended the university of pittsburgh @ johnstown and graduated with a bachelors in computer science, with a minor in information systems'}
                highlightedWords={['university', 'pittsburgh', 'johnstown', 'bachelors', 'computer', 'science', 'minor', 'information', 'systems']}/>
            <Description
                description={'i am interested in machine learning, distributed systems, and software engineering'}
                highlightedWords={['machine', 'learning', 'distributed', 'systems', 'software', 'engineering']}/>
            <Description
                description={`fun fact: ${randomFunFact[Math.floor(Math.random() * randomFunFact.length)]}`}
                highlightedWords={['fun', 'fact:']}/>
        </main>
    );
}