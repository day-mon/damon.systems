import {Meta, Title} from "@solidjs/meta";
import Description from "~/components/description";


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
            <Meta name="keywords"
                  content="damon, about, me, software, engineer, usa, pitt, pittsburgh, johnstown, t, rowe, price, machine, learning, distributed, systems, engineering"/>
            <Meta name="og:title" content="damon | about"/>
            <Meta name="og:description" content="about me"/>
            <Meta property="og:site_name" content="damon"/>
            <Meta name="og:url" content="https://damon.systems/about"/>
            <Meta name="og:image" content="/about.png"/>
            <main
                class="flex flex-col justify-center items-center text-center space-y-3 p-6 animate-fade-in h-[85vh] md:text-2xl">
                <h1 class="lg:text-xl text-2xl italic mb-2">hi.</h1>
                <Description
                    description={`im damon, a ${getAge()} year old software engineer based in the usa`}
                    highlightedWords={['software', `${getAge()}`, 'year', 'old', 'engineer', 'usa']}/>
                <Description description={"im currently working at t rowe price working on making things work so other people can make things work"}
                             highlightedWords={['t', 'rowe', 'price']}/>
                <Description
                    description={'i attended the university of pittsburgh @ johnstown and graduated with a bachelors in computer science'}
                    highlightedWords={['university', 'pittsburgh', 'johnstown', 'bachelors', 'computer', 'science']}/>
                <span>
                    sometimes I{' '}
                    <a class={'font-bold space-x-1 underline'} href="https://www.alltrails.com/members/damon-montague" target="_blank" rel="noopener noreferrer">hike</a>,
                    take <a class={'font-bold underline'} href="https://instagram.com/adopted" target="_blank" rel="noopener noreferrer">pictures</a>,
                    and <a class={'font-bold underline'} href="https://github.com/day-mon" target="_blank" rel="noopener noreferrer">code</a>
                </span>

                <Description
                    description={`fun fact: ${randomFunFact[Math.floor(Math.random() * randomFunFact.length)]}`}
                    highlightedWords={['fun', 'fact:']}/>
            </main>
        </>
    );
}