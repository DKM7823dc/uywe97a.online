$(function(){
    // 获取当前日期
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
    data = [
        {
            "name": "지*",
            "phone": "010-****9152",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "최*지",
            "phone": "010-****5667",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "황*아",
            "phone": "010-****8444",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "이*영",
            "phone": "010-****7567",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "강*연",
            "phone": "010-****4115",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "윤*인",
            "phone": "010-****1137",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "강*진",
            "phone": "010-****7074",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "이*현",
            "phone": "010-****6789",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "B***r",
            "phone": "010-****4344",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "B***r",
            "phone": "010-****4344",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "최*나",
            "phone": "010-****7714",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "이*정",
            "phone": "010-****1471",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "이*정",
            "phone": "010-****1474",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "이*희",
            "phone": "010-****4341",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "이*현",
            "phone": "010-****6153",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "박*영",
            "phone": "010-****4136",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "신*영",
            "phone": "010-****1956",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "이*희",
            "phone": "010-****0788",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "윤*애",
            "phone": "010-****0025",
            "date": formattedDate,
            "status_text": ""
        },
        {
            "name": "송*경",
            "phone": "010-****6466",
            "date": formattedDate,
            "status_text": ""
        }
    ]
    if(data){
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            html += '<li style="margin: 0px; padding: 0px; height: 45px;"><span style="color:#000000;" class="date_yesterday">'+item.date+'</span><span style="color:#000000;">'+item.name+'</span><span style="color:#000000;">'+item.phone+'</span><span style="color:#fff;" class="listbtn">신청 완료</span></li>';
        }
        $('#dv_rolling ul').html(html);
        $("#dv_rolling").vTicker({
            speed: 400,
            pause: 2000,
            animation: 'fade',
            mousePause: true,
            showItems: 4
        });
    }
});
    
function save() {
    var user_name1 = $("#user_name2").val();
    var age1 = $("#age2").val();
    var fm1 = $("input[type='radio'][name='sex2']:checked").val();
    var phone1_0 = $("#tel2").val();
    var phone1_1 = $("#phone2_1").val();
    var phone1_2 = $("#phone2_2").val();
    var height1 = $("#height2").val();
    var weight1 = $("#weight2").val();
    var target = $("input[type='radio'][name='q1']:checked").val();
    var phone = phone1_0+'-'+phone1_1+phone1_2;

    if (phone1_1==='' || phone1_2===''){
        alert('연락처번호 형식이 맞지 않습니다.');
        return false;
    }

    if (phone1_1.length!==4 || phone1_2.length!==4){
        alert('연락처번호 형식이 맞지 않습니다.');
        return false;
    }
    if (!isTrue(phone1_1)) {
        alert('연락처번호 형식이 맞지 않습니다.');
        return false;
    }
    if (!isTrue(phone1_2)) {
        alert('연락처번호 형식이 맞지 않습니다.');
        return false;
    }

    // Prepare data in the format expected by save.php
    var submitData = {
        name: user_name1,
        age: parseInt(age1),
        sex: fm1,
        phone: phone,
        height: height1,
        weight: weight1,
        target: target,
        source: 'Korean Weight Loss Form',
        referrer: document.referrer || '',
        userAgent: navigator.userAgent
    };
    fbq('track', 'AddToCart');
    $.ajax({
        type: "POST",
        async: true,
        url: "save.php",
        contentType: "application/json",
        data: JSON.stringify(submitData),
        success: function(response){
            try {
                var data = typeof response === 'string' ? JSON.parse(response) : response;
                if(data.success){
                    fbq('track', 'Contact');
                    
                    // Read WhatsApp config and redirect if available
                    $.get('whatsapp_config.json')
                        .done(function(config) {
                            if(config && config.whatsapp_link) {
                                // Open WhatsApp in new window
                                window.open(config.whatsapp_link, '_blank');
                            }
                        })
                        .fail(function() {
                            console.log('WhatsApp config not found');
                        });
                    
                    alert('접수 완료되었습니다!');
                    
                    // Optional: redirect to completion page
                    // location.href = '/complete.html';
                } else {
                    alert(data.error || '저장에 실패했습니다.');
                }
            } catch(e) {
                alert('응답 처리 중 오류가 발생했습니다.');
            }
        },
        error: function(xhr, status, error){
            console.error('AJAX Error:', error);
            alert('네트워크 오류가 발생했습니다.');
        }
    });
    //alert('접수 완료되었습니다. Kakao로 빠르게 답변드리겠습니다!');
}

function isTrue(value) {
    return /^\d+$/.test(value);
}

function On_off_layer(num) {
  var objDiv = document.getElementById(num);
  if (objDiv.style.display == "block") {
    objDiv.style.display = "none";
  } else {
    objDiv.style.display = "block";
  }
}
