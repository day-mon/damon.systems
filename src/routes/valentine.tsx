import { createSignal } from "solid-js";
import { Meta, Title } from "@solidjs/meta";

export default function Valentine() {
    const [noCount, setNoCount] = createSignal(0);
    const [yesPressed, setYesPressed] = createSignal(false);
    const [noPosition, setNoPosition] = createSignal({ x: 0, y: 0 });

    const phrases = [
        "No",
        "Are you sure?",
        "Really sure?",
        "Think again!",
        "Last chance!",
        "Surely not?",
        "You might regret this!",
        "Give it another thought!",
        "Are you absolutely certain?",
        "This could be a mistake!",
        "Have a heart!",
        "Don't be so cold!",
        "Change of heart?",
        "Wouldn't you reconsider?",
        "Is that your final answer?",
        "You're breaking my heart 💔",
    ];

    const handleNoHover = () => {
        setNoCount(noCount() + 1);
        // Generate random position
        const maxX = window.innerWidth - 200;
        const maxY = window.innerHeight - 100;
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        setNoPosition({ x: randomX, y: randomY });
    };

    const handleYesClick = () => {
        setYesPressed(true);
    };

    const getNoButtonText = () => {
        return phrases[Math.min(noCount(), phrases.length - 1)];
    };

    const getYesButtonSize = () => {
        return 100 + noCount() * 20;
    };

    return (
        <>
            <Title>Be My Valentine? 💕</Title>
            <Meta property="og:title" content="Be My Valentine?" />
            <Meta property="og:type" content="website" />
            <Meta property="og:image" content="/valentine.png"/>


            <main class="flex flex-col items-center justify-center min-h-screen p-6 bg-background overflow-hidden">
                {yesPressed() ? (
                    <div class="text-center animate-content-show">
                        <h1 class="text-5xl md:text-7xl mb-6 font-bold text-success animate-bounce">
                            Yay! 🎉
                        </h1>
                        <img
                            src="https://media.giphy.com/media/T86i6yDyOYz7J6dPhf/giphy.gif"
                            alt="celebration"
                            class="mx-auto rounded-lg shadow-lg mb-6 max-w-xs border border-border"
                        />
                        <p class="text-2xl md:text-3xl text-foreground font-light">
                            I'LL SEE YOU AT GYU KAKU ON FEB 13 :)
                        </p>
                    </div>
                ) : (
                    <>
                        <div class="text-center relative z-10">
                            <h1 class="text-3xl md:text-5xl mb-4 font-bold text-foreground">
                                Will you be my Valentine? 💕
                            </h1>
                            <img
                                src="https://media.giphy.com/media/cLS1cfxvGOPVpf9g3y/giphy.gif"
                                alt="cute bear"
                                class="mx-auto rounded-lg shadow-lg mb-8 max-w-xs border border-border"
                            />

                            <div class="flex flex-col items-center gap-4">
                                <button
                                    onClick={handleYesClick}
                                    style={{
                                        "font-size": `${getYesButtonSize()}%`,
                                        "padding": `${getYesButtonSize() / 10}px ${getYesButtonSize() / 5}px`
                                    }}
                                    class="bg-success text-success-foreground hover:opacity-90 font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-110"
                                >
                                    Yes! 💖
                                </button>
                            </div>

                            {noCount() > 0 && (
                                <p class="mt-6 text-muted-foreground animate-content-show italic">
                                    {noCount() > 3 ? "The 'Yes' button is getting bigger... 👀" : "Think carefully... 💭"}
                                </p>
                            )}
                        </div>

                        <button
                            onMouseEnter={handleNoHover}
                            onTouchStart={handleNoHover}
                            style={{
                                position: "absolute",
                                left: `${noPosition().x}px`,
                                top: `${noPosition().y}px`,
                                transition: "all 0.3s ease"
                            }}
                            class="bg-destructive text-destructive-foreground hover:opacity-90 font-bold rounded-lg shadow px-6 py-3"
                        >
                            {getNoButtonText()}
                        </button>
                    </>
                )}
            </main>
        </>
    );
}