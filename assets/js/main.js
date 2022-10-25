let doc_id = $('body').attr('id');
load_data = () => {
    switch (doc_id) {
        case 'product-data':
            loadProduct();
            break;
    }
}
load_data();

deleteRecord = (id) => {
    let doc_id = $('body').attr('id');
    let table = '';
    switch (doc_id) {
        case 'product-data':
            table = 'products';
            break;
    }
    let sql = `DELETE FROM ${table} WHERE id = ${id}`;
    db.query(sql, (err, data) => {
        if (err) throw err && console.log('err',err);
        load_data();
    });
}

deleteAllRecords = () => {
    let doc_id = $('body').attr('id');
    let table = '';
    switch (doc_id) {
        case 'product-data':
            table = 'products';
            break;
    }
    let sql = `DELETE FROM ${table}`;
    db.query(sql, (err, data) => {
        if (err) throw err && console.log('err',err);
        load_data();
    });
}

deleteMultipleRecords = (ids) => {
    let doc_id = $('body').attr('id');
    let table = '';
    switch (doc_id) {
        case 'product-data':
            table = 'products';
            break;
    }
    let sql = `DELETE FROM ${table} WHERE id IN (${ids})`;
    db.query(sql, (err, data) => {
        if (err) throw err && console.log('err',err);
        load_data();
    });
}

// checkbox check
$('tbody#data').on('click', 'tr', function () {
    let data_id = $(this).attr('data-id');
    let checkBox = $('Input[type="checkbox"]#'+data_id);
    checkBox.prop('checked', !checkBox.prop('checked'));
});