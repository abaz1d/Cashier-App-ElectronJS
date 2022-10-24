
let inputPrdPrice = IMask(
    document.getElementById('product_price'), {
    mask: 'num',
    blocks: {
        num: {
            mask: Number,
            thousandsSeparator: '.',
            scale: 3,
            radix: ',',
            mapIoRadix: ['.'],
            padFractionalZeros: false,
            signed: false,
        }
    }
}
);

let inputPrdCost = IMask(
    document.getElementById('product_cost'), {
    mask: 'num',
    blocks: {
        num: {
            mask: Number,
            thousandsSeparator: '.',
            scale: 3,
            radix: ',',
            mapIoRadix: ['.'],
            padFractionalZeros: false,
            signed: false,
        }
    }
}
);

let inputPrdQty = IMask(
    document.getElementById('product_intial_qty'), {
    mask: 'num',
    blocks: {
        num: {
            mask: Number,
            thousandsSeparator: '.',
            padFractionalZeros: false,
            signed: false,
        }
    }
}
);


loadProduct = () => {
    let sql = "SELECT * FROM products";
    db.query(sql, (err, data) => {
        if (err) throw err;
        let tr = '';
        if (data.length < 1) {
            tr += ''
        } else {
            data.rows.forEach((row) => {
                tr += `<tr data-id=${row.id}>
                    <td>${row.id}</td>
                    <td>${row.product_name}</td>
                    <td>${row.product_code}</td>
                    <td>${row.barcode}</td>
                    <td>${row.category}</td>
                    <td>${row.unit}</td>
                    <td>${currencyFormatter.format(row.selling_price)}</td>
                    <td>${currencyFormatter.format(row.cost_of_product)}</td>
                    <td>${row.product_intial_qty}</td>
                    <td class="d-flex justify-content-center">
                        <button class="btn btn-sm btn-success action-btn" onclick="editProduct(${row.id})"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn btn-danger btn-sm action-btn" onclick="deleteProduct(${row.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>`;
            });
        }
        $('tbody#data').html(tr);
    });
}

resetForm = () => {
    $('#product_name').val('');
    $('#product_code').val('');
    $('#product_barcode').val('');
    $('#product_category').val('');
    $('#unit').val('');
    $('#product_price').val('');
    $('#product_cost').val('');
    $('#product_intial_qty').val('');
}

insertProduct = () => {
    let product_name = $('#product_name').val();
    let product_code = $('#product_code').val();
    let barcode = $('#product_barcode').val();
    let category = $('#product_category').val();
    let unit = $('#unit').val();
    let selling_price = inputPrdPrice.unmaskedValue;
    let cost_of_product = inputPrdCost.unmaskedValue;
    let product_intial_qty = inputPrdQty.unmaskedValue;

    let required = $('[required]');
    let required_array = [];
    required.each(function () {
        if ($(this).val() != '') {
            required_array.push($(this));
        }
    });

    if (required_array.length < 4) {
        dialog.showMessageBoxSync({
            title: 'Alert',
            type: 'info',
            message: 'Nama Produk, Harga Jual, Harga Pokok, dan Satuan harus diisi ⚠️',
        });
    } else if (parseInt(selling_price) < parseInt(cost_of_product)) {
        dialog.showMessageBoxSync({
            title: 'Alert',
            type: 'info',
            message: 'Harga Jual tidak boleh lebih kecil dari Harga Pokok ⚠️',
        });
    } else {
        db.query("SELECT COUNT(*) AS row_number FROM products WHERE product_name = $1", [product_name], (err, res) => {
            if (err) throw err;
            if (res.rows[0].row_number < 1) {
                db.query(`INSERT INTO products (product_name, product_code, barcode, category, unit, selling_price, cost_of_product, product_intial_qty) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [product_name, product_code, barcode, category, unit, selling_price, cost_of_product, product_intial_qty], (err, data) => {
                        if (err) throw err;
                        resetForm();
                        $('#product_name').focus();
                        loadProduct();
                    });
            } else {
                dialog.showMessageBoxSync({
                    title: 'Alert',
                    type: 'info',
                    message: 'Nama Produk sudah ada ⚠️',
                });
            }
        });
    }
}