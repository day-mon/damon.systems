<script>
    import Typewriter from 'svelte-typewriter';

    const birthDay = new Date(2001, 2, 2)
    const today = new Date()
    const age = today.getFullYear() - birthDay.getFullYear()

    const text = `struct Human<'a> {
        first_name: &'a str,
        last_name:  &'a str,
        suffix: Option<&'a str>,
        age: i8,
        hobbies: Vec<&'a str>,
        socials: HashMap<&'a str, &'a str>,
    }

    Human {
        first_name: "Damon",
        last_name: "Montague",
        suffix: Option::from("Jr."),
        age: ${age},
        hobbies: vec![
            "Programming",
            "Personal Finance",
            "Technology"
        ],
        socials: hashmap!{
            "github" => "github.damon.systems",
            "linkedin" => "linkedin.damon.systems",
            "twitter" => "twitter.damon.systems",
            "email" => "damon@montague.im",
        }
    }`


    window.addEventListener('DOMContentLoaded', () => {
       // console.log the size of screen
         console.log(window.innerWidth, window.innerHeight)
    })

    addEventListener('resize', () => {
        console.log(window.innerWidth, window.innerHeight)
        localStorage.setItem('typeDone', 'false')
        location.reload()
    })







</script>

<div id="codeblock">
    <Typewriter disabled={localStorage.getItem('typeDone') === 'true'}
                on:done={() => localStorage.setItem('typeDone', 'true')}
    >
        {text}
    </Typewriter>
</div>


<style>
    /** put div in center of screen and make text bold **/
    #codeblock {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-weight: bold;
        white-space: pre;
        font-size: 30px;
    }


    /** make codeblock visually appealing on mobile **/
    @media only screen and (max-width: 600px) {
        #codeblock {
            position: absolute;
            font-size: 1.1rem;
            justify-content: flex-start;
            padding-left: 1rem;
            margin-top: 70px;

        }
    }

    @media only screen and (max-width: 800px) {
        #codeblock {
            font-size: 17px;
            margin-left: 8px;
        }
    }

    @media only screen and (max-width: 1080px) {
        #codeblock {
            font-size: 24px;
        }
    }

    @media only screen and (max-width: 700px) {
        #codeblock {
            font-size: 15px;
        }
    }


</style>

