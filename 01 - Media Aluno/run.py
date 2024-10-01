from flask import Flask, render_template, request, redirect

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/resultado", methods=['POST'])
def consultar_notas():
    nome = request.form["nome"]
    altura = request.form["altura"]
    peso = request.form["peso"]
    
    caminho_arquivo = 'models/listaalunos.txt'

    n1 = request.form["nota_1"]
    n2 = request.form["nota_2"]
    n3 = request.form["nota_3"]
    media = (float(n1) + float(n2) + float(n3)) / 3

    if media >= 7:
        status = "Aprovado"
    elif media >= 3:
        status = "Em Recuperação"
    else:
        status = "Reprovado"
    
    with open(caminho_arquivo, 'a') as arquivo:
        arquivo.write(f"{nome_aluno};{nota_1};{nota_2};{nota_3};{media};{status}\n")

    return redirect("/")

@app.route("/notas")
def notas():
    informaçoes = []
    caminho_arquivo = 'models/listaalunos.txt'

    with open(caminho_arquivo, 'r') as arquivo:
        for informaçao in arquivo:
            item = informaçao.strip().split(';')
            informaçoes.append({
                'nome_aluno': item[0],
                'nota_1': item[1],
                'nota_2': item[2],  
                'nota_3': item[3],
                'media': (round(float(item[4]),2)),
                'status': item[5]
            })

    return render_template("consulta_produtos.html", inf=informaçoes)

app.run(host='127.0.0.1', port=80, debug=True)