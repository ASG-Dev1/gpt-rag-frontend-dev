import css from '../../components/Common/Button.module.css'

export const AccordionItemList = ({ header, content }) => {

     const handleAccordionClick = () => {

     }


     return <>
          <div className='accorion'>
               <button className={css.accordionBtn} onClick={handleAccordionClick}>

               </button>
               <div className='accordion-content'></div>
          </div>
     </>
}