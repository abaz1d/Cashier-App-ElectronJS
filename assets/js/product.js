
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
                    <td data-colname="ID class="d-flex justify-content-center">
                        <input class="data-checkbox" id='${row.id}' type="checkbox">
                    </td>
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
                        <button class="btn btn-sm btn-success action-btn" onclick="editRecord(${row.id})" id="edit-data"><i class="fa-solid fa-pencil"></i></button>
                        <button class="btn btn-danger btn-sm action-btn" onclick="deleteAction(${row.id}, '${row.product_name}')" id="delete-data"><i class="fa-solid fa-trash"></i></button>
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
    $('#product_unit').val('');
    $('#product_price').val('');
    $('#product_cost').val('');
    $('#product_intial_qty').val('');
}

insertProduct = () => {
    let product_name = $('#product_name').val();
    let product_code = $('#product_code').val();
    let barcode = $('#product_barcode').val();
    let category = $('#product_category').val();
    let unit = $('#product_unit').val();
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
                        //generate code product
                        db.query("SELECT id FROM products WHERE product_name = $1", [product_name], (err, row) => {
                            if (err) throw err
                            db.query(`UPDATE products SET product_code = concat('PR-','000000',${row.rows[0].id}) WHERE product_name = $1`, [product_name], err => {
                                if (err) throw err
                                resetForm();
                                $('#product_name').focus();
                                loadProduct();
                            })
                        })
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

loadCategoryOptions = () => {
    db.query("SELECT * FROM categories ORDER BY category_name ASC", (err, data) => {
        if (err) throw err;
        let option = '<option value="">Kategori</option>';
        data.rows.forEach((row) => {
            option += `<option value="${row.category_name}">${row.category_name}</option>`;
        });
        $('#product_category').html(option);
    });
}

loadUnitOptions = () => {
    db.query("SELECT * FROM unit ORDER BY unit_name ASC", (err, data) => {
        if (err) throw err;
        let option = '<option value="">Satuan</option>';
        data.rows.forEach((row) => {
            option += `<option value="${row.unit_name}">${row.unit_name}</option>`;
        });
        $('#product_unit').html(option)
    });
}

function selectUnitOption(unitOpt, unit) {
    let options = unitOpt.replace(`value="${unit}"`, `value="${unit}" selected`);
    return options;
}

function selectCategoryOption(categoryOpt, category) {
    let options = categoryOpt.replace(`value="${category}"`, `value="${category}" selected`);
    return options;
}

editPrdData = (id) => {
    let sqlUnit = "SELECT * FROM unit ORDER BY unit_name ASC";
    let sqlCategory = "SELECT * FROM categories ORDER BY category_name ASC";
    let sql = "SELECT * FROM products WHERE id = $1";

    db.query(sqlUnit, (err, result) => {
        if (err) {
            throw err;
        } else {
            let unitOption
            let unitOpts = '<option></option>';
            result.rows.forEach((row) => {
                unitOpts = `<option value="${row.unit_name}">${row.unit_name}</option>`;
            });
            unitOption = unitOpts;
            db.query(sqlCategory, (err, result) => {
                if (err) {
                    throw err;
                } else {
                    let categoryOption
                    let categoryOpts = '<option></option>';
                    result.rows.forEach((row) => {
                        categoryOpts = `<option value="${row.category_name}">${row.category_name}</option>`;
                    });
                    categoryOption = categoryOpts;
                    db.query(sql, [id], (err, result) => {
                        if (err) {
                            throw err;
                        } else {
                            let row = result.rows[0];
                            let editForm
                            editForm = `<nav class="navbar navbar-light bg-light fixed-top">
                                            <div class="container-fluid">
                                                <div style="display: inline-block;">
                                                    <span id="store-name" class="ms-2" style="font-size: 14.5px; font">
                                                        ${row.id} - ${row.product_name}
                                                    </span>
                                                </div>
                                                <div style="display: inline-block;">
                                                    <div class="dropdown" style="display: inline;">
                                                        <button class="btn btn-sm btn-danger btn-block" onclick="cancelEditPrdData()"><i class="fa-solid fa-times"></i></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </nav>
                                        <div class="mb-3">
                                            <input type="text" class="form-control form-control-sm" placeholder="Nama Produk" id="editPrdName" value="${row.product_name}" required>
                                            <input type="hidden" id="prevPrdName" value="${row.product_name}">
                                            <input type="hidden" id="rowId" value="${row.id}">
                                        </div>
                                        <div class="mb-3">
                                            <input type="text" class="form-control form-control-sm" placeholder="Barcode" id="editPrdBarcode" value="${row.barcode}" required>
                                            <input type="hidden" id="prevPrdBarcode" value="${row.barcode}">
                                        </div>
                                        <div class="mb-3>
                                            <select class="form-select form-select-sm" id="editPrdCategory">
                                                ${selectCategoryOption(categoryOption, row.category)}
                                            </select>
                                        </div>
                                        <div class="mb-3>
                                            <select class="form-select form-select-sm" id="editPrdUnit">
                                                ${selectUnitOption(unitOption, row.unit)}
                                            </select>
                                        </div>
                                        <div class="mb-3>
                                            <input type="text" class="form-control form-control-sm" placeholder="Harga Jual" id="editPrdPrice" value="${row.selling_price}">
                                        </div>
                                        <div class="mb-3>
                                            <input type="text" class="form-control form-control-sm" placeholder="Harga Pokok" id="editPrdCost" value="${row.cost_of_product}">
                                        </div>
                                        <div class="mb-3>
                                            <input type="text" class="form-control form-control-sm" placeholder="Stok Awal" id="editPrdInitQty" value="${row.product_intial_qty}">
                                        </div>
                                        <div class="d-grid-gap-2>
                                            <button class="btn btn-sm btn-primary btn-block" onclick="submitEditPrdData(${id})" id="btn-submit-edit"><i class="fa-solid fa-paper-plane"></i> Simpan</button>

                                        </div>`

                            ipcRenderer.send('load:edit','product-data',editForm,600,900, id)
                        }
                    });
                }
            });
        }
    });
}

ipcRenderer.on('update:success', (e, msg) => {
    alertSuccess(msg)
    load_data();
})
