from flask import Flask, render_template, request, redirect

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/validar_imc", methods=['POST'])
def validar_notas():
    nome_paciente = request.form["nome_paciente"]
    altura = float(request.form["altura"])
    peso = float(request.form["peso"])    

    imc = peso / (altura ** 2)
    
    if imc < 18.5:
        status = "Abaixo do Peso"
    elif 18.5 <= imc < 24.9:
        status = "Peso Normal"
    elif 25 <= imc < 29.9:
        status = "Sobrepeso"
    else:
        status = "Obesidade"
    
    caminho_arquivo = 'models/imc.txt'

    with open(caminho_arquivo, 'a') as arquivo:
        arquivo.write(f"{nome_paciente};{peso};{altura};{imc:.2f};{status}\n")

    return redirect("/")

@app.route("/consulta")
def consulta_notas():
    notas = []
    caminho_arquivo = 'models/imc.txt'

    with open(caminho_arquivo, 'r') as arquivo:
        for linha in arquivo:
            item = linha.strip().split(';')
            if len(item) == 5: 
                notas.append({
                    'nome': item[0],
                    'peso': item[1],
                    'altura': item[2],
                    'imc': item[3],
                    'status': item[4]
                })
    return render_template("consulta_notas.html", prod=notas)

@app.route("/excluir_notas", methods=['GET'])
def excluir_notas():
    linha_para_excluir = int(request.args.get('linha')) 
    caminho_arquivo = 'models/notas.txt'
    
    with open(caminho_arquivo, 'r') as arquivo:
        linhas = arquivo.readlines()
    
    del linhas[linha_para_excluir]  

    with open(caminho_arquivo, 'w') as arquivo:
        arquivo.writelines(linhas)

    return redirect("/consulta") 

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=80, debug=True)