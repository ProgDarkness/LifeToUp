import AppLayout from 'components/AppLayout'
import { Card } from 'primereact/card'
import { ReponseMenu, Menu } from './MenuLayout'

function AppLayoutMenus({
  children,
  title,
  items
}) {
  return (
    <AppLayout>
      <div className="flex justify-end w-[95%] mt-3 md:mb-2 md:mt-6">
        <Card className="bg-[#00454d] redondeo-xl w-[95%] md:w-[43vw]">
          <div className="flex flex-row">
            <div className="basis-9/12">
              <p className="text-[#2c9eaa] text-2xl xl:text-4xl font-extrabold tracking-widest pl-1 xl:pl-10">
                {title?.toUpperCase()}
              </p>
            </div>
            <div className="basis-3/12">
              <ReponseMenu
                items={items}
              />
            </div>
          </div>
        </Card>
      </div>
      <div className="flex flex-row w-[95%] lg:h-[85%] gap-4 m-auto pb-12">
        <div className="basis-full xl:basis-[90%]">
          <Card className="redondeo-xl h-[80vh] max-h-[80vh] lg:h-full overflow-auto border-2 border-[#2c9eaa]">
            {children}
          </Card>
        </div>
        <div className="basis-[11rem] hidden xl:flex">
          <Menu items={items}/>
        </div>
      </div>
    </AppLayout>
  )
}

export { AppLayoutMenus }
