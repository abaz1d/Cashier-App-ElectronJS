
closeCashier = () => {
    ipcRenderer.send('close:cashier-window');
}

getProductName = () => {
    let sql = 'SELECT * FROM products ORDER BY id DESC';
    db.query(sql, (err, result) => {
        if (err) throw err;
        let output = '<option value="">Nama Produk</option>';
        result.rows.forEach(row => {
            output += `
                <option value="${row.product_name}">${row.product_name}</option>
            `;
        });
        $('#product_name').html(output);
    });
}
getProductName();

today = () => {
    let d = new Date();
    let day = d.getDate().toString().padStart(2, 0);
    let month = (d.getMonth() + 1).toString().padStart(2, 0);
    let year = d.getFullYear();
    $('#info-sales-date').html(`${day}/${month}/${year}`);
}
today();

openSales = () => {
    let sales_number = $('#sales-number').val();
    let buyer = $('#buyer-select').val();
    let buyer_id = $('#buyer_id').val();
    let buyer_address = $('#buyer-address').val();
    let po_number = $('#po-number').val();
    let payment = $('#cash-credit').val();
    let due_date = $('#due-date').val();
    let term = $('#term').val();
    let description = $('#description').val();

    today();
    $('#info-sales-number').html(sales_number);
    $('#info-buyer').html(buyer);
    let tax_rate
    let tax_checked = [];
    $('.sales-tax:checked').each(function () {
        tax_checked.push('checked');
    });
    if (tax_checked.length < 1) {
        tax_rate = 0;
        $('#tax-rate').val(tax_rate);
    } else {
        tax_rate = 10;
        $('#tax-rate').val(tax_rate);
    }
    $('#modal-new-sales').modal('hide');
    $('.sales-input').removeAttr('disabled');
    $('#btn-new-sales').prop('disabled', true);
}

let prdCodeArray = [];

db.query('SELECT * FROM products', (err, result) => {
    if (err) throw err;
    result.rows.map(row => {
        prdCodeArray.push(row.product_code);
    });
});

$('#product_code').autocomplete({
    source: prdCodeArray,
});

getCodeByName = () => {
    let product_name = $('#product_name').val();
    if (product_name == '') {
        $('#product_code').val('');
    } else {
        let sql = `SELECT * FROM products WHERE product_name = '${product_name}'`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            if (result.rows.length < 1) {
                $('#product_code').val('');
            } else {
                $('#product_code').val(result.rows[0].product_code);
            }
        });
    }
}