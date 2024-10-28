import css from '../../components/Common/Button.module.css';
import styles from "./AccordionItemList.module.css";
import { useState } from 'react';
import PdfModal from "../PdfModal/PdfModal";

// Define the AccordionItemListProps interface, including the onUrlClick function
type AccordionItemListProps = {
     header: string;
     content: { [key: string]: string | number };
     url: string;
     onUrlClick: (url: string) => void; // Add onUrlClick to the props
};

export const AccordionItemList = ({ header, content, url, onUrlClick }: AccordionItemListProps) => {
     const [itemContent, setItemContent] = useState(false);
     // const [isModalOpen, setIsModalOpen] = useState(false); // State to manage the modal visibility
     // const [pdfData, setPdfData] = useState<{ name: string; url: string } | null>(null); // State to hold PDF data

     // Function to extract the filename from a URL for modal pdfbutton
     // const extractFilename = (url: string) => {
     //      return url.split('/').pop()?.split('#')[0]?.split('?')[0] || "Unknown Filename"; // Extract file name from the URL
     // };

     // Handle the accordion dropdown when clicked
     const handleAccordionClick = () => {
          setItemContent(!itemContent);
     };

     const handleDataPointUrlClick = (url: string) => {
          console.log("Clicked! V2");
          console.log(url);
          onUrlClick(url); // Call the passed onUrlClick function
     };

     const StructuredText = (text: string) => {

          text = text.replace(/n\/a/gi, "")
          return text.toLowerCase().replace(/(^\w{1})/g, (letter) => letter.toUpperCase());
     }

     const structuredQuantitys = (money: string) => {
          return parseFloat(money) > 999.99
               ? `$${money.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
               : `$${money}`

     }

     // Renders Each Item List Modal
     return (
          <>
               <div className="accordion" onClick={handleAccordionClick}>
                    <p className={styles.itemsHeader} style={{ marginBottom: itemContent === true ? '1.5rem' : '0' }}>
                         {StructuredText(header)}
                    </p>
                    <div className="accordion-content" style={{ display: itemContent === true ? 'block' : 'none' }}>
                         {Object.entries(content).map(([key, value], index) => (
                              <div key={index}>
                                   <p className={styles.itemsTitle}>{key}</p>
                                   {index >= 14 && index < 17
                                        ? <p className={styles.itemsValue}>{structuredQuantitys(value.toString())}</p>
                                        : <p className={styles.itemsValue}>{StructuredText(value.toString())}</p>}
                              </div>
                         ))}
                         <p className={styles.itemsTitle}>Url de Archivo de Orden de Compra:</p>
                         <button className={`${css.buttonStructure} ${css.urlItemPdf}`} onClick={() => handleDataPointUrlClick(url)}>
                              {url}
                         </button>
                    </div>
               </div>
          </>
     );
};

export default AccordionItemList;
