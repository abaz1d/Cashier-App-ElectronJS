let doc_id = $('body').attr('id');
load_data = () => {
    switch (doc_id) {
        case 'product-data':    
        loadProduct();
        break;
    }
}
load_data();