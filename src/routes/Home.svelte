<script>
    import Typewriter from 'svelte-typewriter';
    const birthDay = new Date(2001, 2, 2)
    const today = new Date()
    const age = today.getFullYear() - birthDay.getFullYear()

    const text = `struct Human {
        first_name: &str,
        last_name: &str,
        suffix: Option<&str>,
        age: i8,
        hobbies: Vec<&str>,
        socials: HashMap<&str, &str>,
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


</script>

<div id="codeblock">
    <Typewriter
            disabled={localStorage.getItem('typeDone') === 'true'}
            on:done={() => localStorage.setItem('typeDone', 'true')}>
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
            font-size: 1.2rem;
            justify-content: flex-start;
            padding-left: 1rem;
            margin-top: 70px;

        }
    }
</style>

