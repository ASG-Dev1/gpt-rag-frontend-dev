import css from '../../components/Common/Button.module.css'
import styles from   "./AccordionItemList.module.css"
import { useState } from 'react'

type AccordionItemListProps = {
     header: string,
     content: { [key: string]: string | number },
     url: string
}

export const AccordionItemList = ({ header, content, url }: AccordionItemListProps) => {

     const [itemContent, setItemContent] = useState(false)
     const [isModalOpen, setIsModalOpen] = useState(false); // State to manage the modal visibility
     const [pdfData, setPdfData] = useState<{ name: string; url: string } | null>(null); // State to hold PDF data

     // Function to extract the filename from a URL for modal pdfbutton
     const extractFilename = (url: string) => {
          return url.split('/').pop()?.split('#')[0]?.split('?')[0] || "Unknown Filename"; // Extract file name from the URL
     };

     // Handle the accordion dropdown when clicked
     const handleAccordionClick = () => {
          setItemContent(!itemContent)
     }

     const handleDataPointUrlClick = (url: string) => {
          const filename = extractFilename(url);
          setPdfData({
               name: filename,
               url: url
          });
          setIsModalOpen(true); // Open the modal
     };

     // Renders Each Item List Modal
     return <>
          <div className='accorion' onClick={handleAccordionClick} >
               <p className={styles.itemsHeader}>
                    {header}
               </p>
               <div className='accordion-content' style={{ display: itemContent === true ? 'block' : 'none' }}>
                    {Object.entries(content).map(([key, value], index) => (
                         <><div key={index}>
                              <p className={styles.itemsTitle}>{key}:</p> <p className={styles.itemsValue}>{value}</p>
                         </div>
                         </>
                    ))}
                   <p className={styles.itemsTitle}> Url_de_Archivo_de_Orden_de_Compra:</p> 
                    <button className={`${css.buttonStructure} ${css.urlItemPdf}`} onClick={() => handleDataPointUrlClick(url)}> {url}</button>
               </div>
          </div>
     </>
}

export default AccordionItemList;