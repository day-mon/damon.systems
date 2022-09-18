<script>
    import Typewriter from 'svelte-typewriter'
    const birthDay = new Date(2001, 2, 2)
    const today = new Date()
    const age = today.getFullYear() - birthDay.getFullYear()
    // make link clickable in typewriter
    const linkify = (text) => {
        const regex = /\[(.*?)\]\((.*?)\)/g
        return text.replace(regex, '<a href="$2" target="_blank">$1</a>')
    }

    // make this link clickable in typewriter given a string


    const text = `struct Human {
        first_name: String,
        last_name: String,
        suffix: Option\<\\String>,
        age: u8,
        hobbies: Vec\<\\String>,
        socials: HashMap\<\\String, String>,
    }

    Human {
        first_name: "Damon",
        last_name: "Montague",
        suffix: Option::from("Jr."),
        age: ${age},
        hobbies: vec![
            "Programming".to_string(),
            "Personal Finance".to_string(),
            "Technology".to_string()
        ],
        socials: hashmap!{
            "github".to_string() => "github.damon.systems".to_string(),
            "linkedin".to_string() => "linkedin.damon.systems".to_string(),
            "twitter".to_string() => "twitter.damon.systems".to_string(),
            "email".to_string() => "damon@montague.im".to_string(),
        }
    }`

    // escape \S and make a string
    const escape = (text) => {
        return text.replace(/\\/g, '\\\\')
    }
    let ee = escape(text)
</script>

<div id="codeblock">
    <Typewriter
            disabled={localStorage.getItem('typeDone') === 'true'}
            on:done={() => localStorage.setItem('typeDone', 'true')}>
        {ee}
    </Typewriter>
</div>


<style>
    /** center div on mobile and desktop but dont center text and leave in white spaces  **/
    #codeblock {
        display: flex;
        justify-content: center;
        width: 100%;
        font-weight: bold;
        height: 100%;
        font-size: 1.5rem;
        white-space: pre;
    }

  /** make codeblock visually appealing on mobile **/
    @media only screen and (max-width: 600px) {
        #codeblock {
            font-size: 1.2rem;
            justify-content: flex-start;
            padding-left: 1rem;
            margin-top: 30px;

        }
    }
</style>

