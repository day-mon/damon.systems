import Description from "~/components/Description";
import {Meta, Title} from "solid-start";

export default function About() {
    const age = new Date('2001-02-02');

    function getAge() {

        const now = new Date();
        const _age = now.getFullYear() - age.getFullYear();
        const m = now.getMonth() - age.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < age.getDate())) {
            return _age - 1;
        }
        return _age;
    }

    const randomFunFact = [
        'i do not have a favorite color',
        'i like lowercase letters',
        'i have been to universal in florida 10 times',
        'i played divisional paintball for 2 years'
    ]

    return (
        <>
            <Title>damon | about</Title>
            <Meta name="description" content="about me"/>
            <Meta name="keywords" content="damon, about, me, software, engineer, usa, pitt, pittsburgh, johnstown, t, rowe, price, emerging, technologies, machine, learning, distributed, systems, engineering"/>
            <Meta name="og:title" content="damon | about"/>
            <Meta name="og:description" content="about me"/>
            <Meta property="og:site_name" content="damon" />
            <Meta name="og:url" content="https://damon.systems/about"/>
            <Meta name="og:image" content="/about.png"/>
            <main class="flex flex-col justify-center items-center text-center space-y-3 p-6 animate-fade-in h-[85vh] md:text-2xl">
                <h1 class="lg:text-xl text-2xl italic mb-2">hi.</h1>
                <Description
                    description={`im damon, a ${getAge()} year old software engineer based in the usa`}
                    highlightedWords={['software', `${getAge()}`, 'year', 'old', 'engineer', 'usa']}/>
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
        </>
    );
}