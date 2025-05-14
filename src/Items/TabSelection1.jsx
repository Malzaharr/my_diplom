import Button from "../Button/Button";

export default function TabsSelection1({ active, onChange }) {
    return (
      <section>
        <Button isActive={active === "feedback"} onClick={() => onChange("feedback")} > Корзина </Button>
        <Button isActive={active === "main"} onClick={() => onChange("main")}> Главная </Button>
      </section>
    );
  }