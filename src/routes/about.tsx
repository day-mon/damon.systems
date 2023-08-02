import Description from "~/components/Description";


export default function About() {
    const age = new Date('2001-02-02')
    return (
        <main class="flex flex-col justify-center items-center h-[85vh] text-center p-10 sm:px-10 animate-fade-in">
            <h1 class="text-2xl sm:text-4xl italic mb-2">hi.</h1>
            <Description description={`im damon, a ${new Date().getFullYear() - age.getFullYear()} year old software engineer based in the usa`} highlightedWords={['software',  '22', 'year', 'old', 'engineer', 'usa']}/>
            <Description description={"im currently working at t rowe price working on emerging technologies"} highlightedWords={['t', 'rowe', 'price', 'emerging', 'technologies']}/>
            <Description description={'i attended the university of pittsburgh @ johnstown and graduated with a bachelors in computer science, with a minor in information systems'} highlightedWords={['university', 'pittsburgh', 'johnstown',  'bachelors', 'computer', 'science', 'minor', 'information', 'systems']}/>
            <Description description={'i am interested in machine learning, distributed systems, and software engineering'} highlightedWords={['machine', 'learning', 'distributed', 'systems', 'software', 'engineering']}/>
        </main>
    );
}