const availableContractPlans = [
  {
    id: "1st-tarif-tile",
    name: "1 Monats Tarif",
    buttonSelectorId: "one-month-select-button",
  },
  {
    id: "2nd-tarif-tile",
    name: "12 Monats Tarif",
    buttonSelectorId: "12-months-select-button",
  },
  {
    id: "3rd-tarif-tile",
    name: "24 Monats Tarif",
    buttonSelectorId: "24-months-select-button",
  },
];
const contractState = {
  selectedPlan: "2nd-tarif-tile",
};
let planListElement: HTMLElement;
let selectedPlanNameElement: HTMLElement;

const updatePlanList = (initial: boolean) => {
  availableContractPlans.map(({ id, buttonSelectorId, name }, index) => {
    if (initial) {
      document
        .getElementById(buttonSelectorId)
        .addEventListener("click", selectPlan(id));
    }
    let button = document.getElementById(buttonSelectorId) as HTMLLinkElement;
    button.classList.remove("disabled");
    if (id == contractState.selectedPlan) {
      button.classList.add("disabled");
      selectedPlanNameElement.innerHTML = name;

      const listWidth = planListElement.offsetWidth;
      planListElement.scrollTo({
        left: listWidth * index,
        top: 0,
        behavior: "instant",
      });
    }
  });
};

const selectPlan = (planId: string) => (event) => {
  console.log("Select Plan", planId);

  contractState.selectedPlan = planId;
  updatePlanList(false);
};

const navigatePlans = (direction: number) => (event) => {
  if (!planListElement) return;
  const listWidth = planListElement.offsetWidth;
  const currentScrollPosition = planListElement.scrollLeft;
  planListElement.scrollTo({
    left: currentScrollPosition + listWidth * direction,
    top: 0,
    behavior: "smooth",
  });
};

export async function init() {
  console.log("Initialize Contract page");

  // Register events
  document
    .getElementById("plan-nav-left")
    .addEventListener("click", navigatePlans(-1));
  document
    .getElementById("plan-nav-right")
    .addEventListener("click", navigatePlans(1));

  planListElement = document.getElementById("plan-list-selector");
  selectedPlanNameElement = document.getElementById("selected-plan-title-text");

  updatePlanList(true);
}
