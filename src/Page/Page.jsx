import './Page.css'
import Button from '../Button/Button'
import TabsSelection1 from '../Items/TabSelection1'

export default function Header({ activeTab, onTabChange }) {
    return (
      <header>
        <h3>WB</h3>
        <div>
          <TabsSelection1 active={activeTab} onChange={onTabChange} />
        </div>
      </header>
    );
  }