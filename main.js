//-------------------------------start------------------------------------------

const choices = document.querySelectorAll(".init-choice");
let aiButton, aiLevels;
for (let i = 0; i < choices.length; i++)
    choices[i].addEventListener("click", () => {
        let j;
        let firstStage, secondStage;
        let newNormal;

        j = (i + 1) % choices.length;
        choices[j].classList.add("hidden");

        newNormal = choices[i].cloneNode(true);
        choices[i].parentNode.replaceChild(newNormal, choices[i]);
        newNormal.classList.remove("active");

        firstStage = newNormal.querySelector(".first-stage");
        secondStage = newNormal.querySelector(".second-stage");

        firstStage.classList.add("hidden");
        secondStage.classList.remove("hidden");

        if (newNormal.querySelector(".ai-menu")) {
            aiButton = document.querySelector(".ai-button");
            aiLevels = document.querySelector(".ai-levels");

            aiButton.addEventListener("click", () => {
                const aiChoices = aiLevels.querySelectorAll(".ai-level");

                if (aiLevels.classList.contains("inactive")) {
                    aiLevels.classList.remove("inactive");
                    aiLevels.classList.add("active");

                    aiButton.innerText = aiButton.innerText.slice(0, aiButton.innerText.length - 1) + " ☟";
                }

                aiChoices.forEach(choice => choice.addEventListener("click", () => {
                    aiButton.innerText = choice.value + "ー☞";

                    if (choice.value == "Easy")
                        aiButton.style.background = "#60d9bd";
                    else if (choice.value == "Medium")
                        aiButton.style.background = "#dbcc1e";
                    else if (choice.value == "Hard")
                        aiButton.style.background = "#f96565";

                    aiLevels.classList.remove("active");
                    aiLevels.classList.add("inactive");
                }));
            });
        }
    });

//-------------------------------end------------------------------------------