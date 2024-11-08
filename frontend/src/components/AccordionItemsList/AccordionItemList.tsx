import css from '../../components/Common/Button.module.css';
import styles from "./AccordionItemList.module.css";
import { useState } from 'react';
import PdfModal from "../PdfModal/PdfModal";
import { Separator } from '@fluentui/react'

// Define the AccordionItemListProps interface, including the onUrlClick function
type AccordionItemListProps = {
     header: string;
     content: { [key: string]: string | number };
     url: string;
     onUrlClick: (url: string) => void; // Add onUrlClick to the props
     index: string;
};

export const AccordionItemList = ({ header, content, url, onUrlClick, index }: AccordionItemListProps) => {
     const [itemContent, setItemContent] = useState(false);

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

     const structuredQuantities = (money: string) => {
          return parseFloat(money) > 999.99
               ? `$${money.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
               : `$${money}`
     }

     const structuredQuantity = (text: string) => {
          return text.replace(/\.\d+$|\.$/, "");
     }

     // Renders Each Item List Modal
     return (
          <> <div key={index}  className={`${styles.itemContainer} ${itemContent === true ? styles.itemContainerActive : ''}`}>
               <div className={`accordion `} onClick={handleAccordionClick} >
                    <h2 className={styles.itemsHeader} style={{ marginBottom: itemContent === true ? '1.5rem' : '0' }}>
                         {StructuredText(header)}
                    </h2>
                    <div className="accordion-content" style={{
                         display: itemContent === true ? 'block' : 'none',

                    }}>
                         {Object.entries(content).map(([key, value], index) => (
                              <div key={index}>
                                   {value === "title" ? (
                                        <> <div className={styles.separatorDiv}>
                                             <Separator styles={{ root: { width: '100%', '::before': { backgroundColor: '#000' } } }} />
                                        </div>
                                             <h3 className={styles.itemsTitle}>{key}</h3> {/* Use specific title class */}
                                        </>
                                   ) : (
                                        <>
                                             <p className={styles.itemsKeysTitle}>{key}</p>
                                             <p className={styles.itemsValue}>
                                                  {index === 15
                                                       ? structuredQuantity(value.toString())
                                                       : index >= 16 && index < 19
                                                            ? structuredQuantities(value.toString())
                                                            : StructuredText(value.toString())}
                                             </p>
                                        </>
                                   )}
                              </div>
                         ))}
                         <p className={styles.itemsKeysTitle}>Url de Archivo de Orden de Compra:</p>
                         <button className={`${css.buttonStructure} ${css.urlItemPdf}`} onClick={() => handleDataPointUrlClick(url)}>
                              {url}
                         </button>
                    </div>
               </div>
          </div>
          </>
     );
};

export default AccordionItemList;
