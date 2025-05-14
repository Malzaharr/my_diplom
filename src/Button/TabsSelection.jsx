import Button from "./Button";


export default function TabsSelection  ({ active, OnChange}) {
 return(
<section>
    <Button isActive={active === 'feedback'} OnClick={() => OnChange('feedback')}>Начать</Button>
</section>
 );
}