import { Button, ButtonProps } from '../ui/button'

interface CustomTabsProps {
    tabs: string[]
    activeTab: number
    setActiveTab: (idx: number) => void
    type?: 'default' | 'label'
    size?: ButtonProps['size']
    className?: string
    btnclassName?: string
}

export default function CustomTabs({
    tabs,
    activeTab,
    setActiveTab,
    type,
    size,
    className,
    btnclassName,
}: CustomTabsProps) {
    const tabVariant = (idx: number) => {
        if (activeTab === idx) {
            return type === 'label' ? 'activeTabLabel' : 'activeTab'
        }
        return type === 'label' ? 'ghostTabLabel' : 'ghostTab'
    }

    return (
        <div
            id="test-tabs"
            className={`${activeTab === 0 ? 'border-slate-100' : ''} flex items-center ${type === 'label' ? 'gap-2' : ''} ${className}`}
        >
            {tabs.map((tab, index) => (
                <Button
                    key={index}
                    variant={tabVariant(index)}
                    size={size || 'default'}
                    onClick={() => setActiveTab(index)}
                    className={`${activeTab === 0 ? '-mb-[0.1rem]' : ''} ${btnclassName}`}
                >
                    {tab}
                </Button>
            ))}
        </div>
    )
}
